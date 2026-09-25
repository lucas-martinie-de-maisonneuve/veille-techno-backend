import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { createTestApp, closeTestApp } from './setup/app.setup';
import { createAndLoginUser } from './setup/fixtures';

describe('Lists (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let aliceToken: string;
  let bobToken: string;
  let aliceListId: string;

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());

    const alice = await createAndLoginUser(app, 'alice', 'alice@test.com');
    const bob = await createAndLoginUser(app, 'bob', 'bob@test.com');
    aliceToken = alice.token;
    bobToken = bob.token;
  });

  afterAll(async () => {
    await closeTestApp(app, dataSource);
  });

  describe('POST /api/lists', () => {
    it('should create a list for alice', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/lists')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ title: 'Alice Todo' });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Alice Todo');
      expect(res.body.position).toBe(0);
      aliceListId = res.body.id;
    });

    it('should create a list for bob', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/lists')
        .set('Authorization', `Bearer ${bobToken}`)
        .send({ title: 'Bob Todo' });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Bob Todo');
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/lists')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/lists')
        .send({ title: 'Unauthorized' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/lists', () => {
    it('should return only alice lists', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/lists')
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe('Alice Todo');
    });

    it('should return only bob lists', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/lists')
        .set('Authorization', `Bearer ${bobToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe('Bob Todo');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app.getHttpServer()).get('/api/lists');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/lists/:id', () => {
    it('should update alice list', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/lists/${aliceListId}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ title: 'Alice Updated' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Alice Updated');
    });

    it('should return 403 if bob tries to update alice list', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/lists/${aliceListId}`)
        .set('Authorization', `Bearer ${bobToken}`)
        .send({ title: 'Hacked' });

      expect(res.status).toBe(403);
    });

    it('should return 404 if list not found', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/lists/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/lists/:id', () => {
    it('should return 403 if bob tries to delete alice list', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/lists/${aliceListId}`)
        .set('Authorization', `Bearer ${bobToken}`);

      expect(res.status).toBe(403);
    });

    it('should delete alice list', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/lists/${aliceListId}`)
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(204);
    });

    it('should return 404 after deletion', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/lists/${aliceListId}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(404);
    });
  });
});
