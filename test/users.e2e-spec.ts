import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { createTestApp, closeTestApp } from './setup/app.setup';
import { createAndLoginUser } from './setup/fixtures';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let aliceToken: string;
  let aliceId: string;
  let bobToken: string;

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());

    const alice = await createAndLoginUser(app, 'alice', 'alice@test.com');
    const bob = await createAndLoginUser(app, 'bob', 'bob@test.com');
    aliceToken = alice.token;
    bobToken = bob.token;

    // Get alice id via /me
    const me = await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', `Bearer ${aliceToken}`);
    aliceId = me.body.id;
  });

  afterAll(async () => {
    await closeTestApp(app, dataSource);
  });

  describe('GET /api/users/me', () => {
    it('should return current user profile', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(200);
      expect(res.body.username).toBe('alice');
      expect(res.body).not.toHaveProperty('password');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app.getHttpServer()).get('/api/users/me');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should update own profile', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/users/${aliceId}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ username: 'alice_updated' });

      expect(res.status).toBe(200);
      expect(res.body.username).toBe('alice_updated');
      expect(res.body).not.toHaveProperty('password');
    });

    it('should return 403 if bob tries to update alice profile', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/users/${aliceId}`)
        .set('Authorization', `Bearer ${bobToken}`)
        .send({ username: 'hacked' });

      expect(res.status).toBe(403);
    });

    it('should return 403 if non-admin tries to change role', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/users/${aliceId}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ role: 'admin' });

      expect(res.status).toBe(403);
    });

    it('should return 404 if user not found', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ username: 'updated' });

      expect(res.status).toBe(404);
    });
  });
});
