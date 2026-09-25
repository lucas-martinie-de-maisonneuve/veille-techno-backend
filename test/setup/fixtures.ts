import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export interface TestUser {
  token: string;
  id?: string;
}

export async function createAndLoginUser(
  app: INestApplication,
  username: string,
  email: string,
  password = 'password123',
): Promise<TestUser> {
  await request(app.getHttpServer())
    .post('/api/auth/register')
    .send({ username, email, password });

  const res = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email, password });

  return { token: res.body.accesstoken };
}

export async function createList(
  app: INestApplication,
  token: string,
  title: string,
): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/api/lists')
    .set('Authorization', `Bearer ${token}`)
    .send({ title });

  return res.body.id;
}

export async function createCard(
  app: INestApplication,
  token: string,
  listId: string,
  title: string,
): Promise<string> {
  const res = await request(app.getHttpServer())
    .post(`/api/lists/${listId}/cards`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title });

  return res.body.id;
}
