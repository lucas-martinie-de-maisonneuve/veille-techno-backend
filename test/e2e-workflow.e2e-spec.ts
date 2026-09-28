import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { createTestApp, closeTestApp } from './setup/app.setup';

describe('Full Kanban Workflow (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  // State persisted across tests
  let aliceToken: string;
  let aliceId: string;
  let listId: string;
  let cardId: string;
  let secondListId: string;

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());
  });

  afterAll(async () => {
    await closeTestApp(app, dataSource);
  });

  it('1. Register alice', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        username: 'alice',
        email: 'alice@test.com',
        password: 'password123',
      });

    expect(res.status).toBe(201);
    expect(res.body).not.toHaveProperty('password');
  });

  it('2. Login alice', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'password123' });

    expect(res.status).toBe(200);
    aliceToken = res.body.accesstoken;
  });

  it('3. Get profile', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', `Bearer ${aliceToken}`);

    expect(res.status).toBe(200);
    aliceId = res.body.id;
  });

  it('4. Create a list', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/lists')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ title: 'Todo' });

    expect(res.status).toBe(201);
    listId = res.body.id;
  });

  it('5. Create a second list', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/lists')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ title: 'In Progress' });

    expect(res.status).toBe(201);
    secondListId = res.body.id;
  });

  it('6. Create a card in first list', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/lists/${listId}/cards`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        title: 'Fix login bug',
        description: 'The login button is broken',
      });

    expect(res.status).toBe(201);
    expect(res.body.position).toBe(0);
    cardId = res.body.id;
  });

  it('7. Update the card', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/cards/${cardId}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ title: 'Fix login bug (updated)' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Fix login bug (updated)');
  });

  it('8. Move card to second list', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/cards/${cardId}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ listId: secondListId });

    expect(res.status).toBe(200);
    expect(res.body.list.id).toBe(secondListId);
  });

  it('9. Update alice username', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/users/${aliceId}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ username: 'alice_updated' });

    expect(res.status).toBe(200);
    expect(res.body.username).toBe('alice_updated');
  });

  it('10. Delete card', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/cards/${cardId}`)
      .set('Authorization', `Bearer ${aliceToken}`);

    expect(res.status).toBe(204);
  });

  it('11. Verify card is deleted', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/cards/${cardId}`)
      .set('Authorization', `Bearer ${aliceToken}`);

    expect(res.status).toBe(404);
  });

  it('12. Delete lists', async () => {
    await request(app.getHttpServer())
      .delete(`/api/lists/${listId}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .delete(`/api/lists/${secondListId}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .expect(204);
  });
});
