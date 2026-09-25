import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { createTestApp, closeTestApp } from './setup/app.setup';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());
  });

  afterAll(async () => {
    await closeTestApp(app, dataSource);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: 'alice',
          email: 'alice@test.com',
          password: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body).not.toHaveProperty('password');
      expect(res.body.username).toBe('alice');
      expect(res.body.role).toBe('user');
    });

    it('should return 409 if email already exists', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: 'alice2',
          email: 'alice@test.com',
          password: 'password123',
        });

      expect(res.status).toBe(409);
    });

    it('should return 409 if username already exists', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: 'alice',
          email: 'alice2@test.com',
          password: 'password123',
        });

      expect(res.status).toBe(409);
    });

    it('should return 400 if email is invalid', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: 'test',
          email: 'not-an-email',
          password: 'password123',
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 if password is too short', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: 'test',
          email: 'test@test.com',
          password: '123',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login and return accesstoken', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'alice@test.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accesstoken');
    });

    it('should return 401 if password is wrong', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'alice@test.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
    });

    it('should return 401 if user does not exist', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'unknown@test.com',
          password: 'password123',
        });

      expect(res.status).toBe(401);
    });

    it('should return 401 on protected route without token', async () => {
      const res = await request(app.getHttpServer()).get('/api/lists');
      expect(res.status).toBe(401);
    });
  });
});
