import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { createTestApp, closeTestApp } from './setup/app.setup';
import { createAndLoginUser, createList, createCard } from './setup/fixtures';

describe('Cards (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let aliceToken: string;
    let bobToken: string;
    let aliceListId: string;
    let aliceCardId: string;

    beforeAll(async () => {
        ({ app, dataSource } = await createTestApp());

        const alice = await createAndLoginUser(app, 'alice', 'alice@test.com');
        const bob = await createAndLoginUser(app, 'bob', 'bob@test.com');
        aliceToken = alice.token;
        bobToken = bob.token;

        aliceListId = await createList(app, aliceToken, 'Alice Todo');
    });

    afterAll(async () => {
        await closeTestApp(app, dataSource);
    });

    describe('POST /api/lists/:listId/cards', () => {
        it('should create a card in alice list', async () => {
            const res = await request(app.getHttpServer())
                .post(`/api/lists/${aliceListId}/cards`)
                .set('Authorization', `Bearer ${aliceToken}`)
                .send({ title: 'Fix login bug' });

            expect(res.status).toBe(201);
            expect(res.body.title).toBe('Fix login bug');
            expect(res.body.position).toBe(0);
            aliceCardId = res.body.id;
        });

        it('should return 403 if bob tries to create card in alice list', async () => {
            const res = await request(app.getHttpServer())
                .post(`/api/lists/${aliceListId}/cards`)
                .set('Authorization', `Bearer ${bobToken}`)
                .send({ title: 'Hacked card' });

            expect(res.status).toBe(403);
        });

        it('should return 400 if title is missing', async () => {
            const res = await request(app.getHttpServer())
                .post(`/api/lists/${aliceListId}/cards`)
                .set('Authorization', `Bearer ${aliceToken}`)
                .send({});

            expect(res.status).toBe(400);
        });

        it('should return 404 if list not found', async () => {
            const res = await request(app.getHttpServer())
                .post('/api/lists/00000000-0000-0000-0000-000000000000/cards')
                .set('Authorization', `Bearer ${aliceToken}`)
                .send({ title: 'Card' });

            expect(res.status).toBe(404);
        });
    });

    describe('GET /api/lists/:listId/cards', () => {
        it('should return all cards of alice list', async () => {
            const res = await request(app.getHttpServer())
                .get(`/api/lists/${aliceListId}/cards`)
                .set('Authorization', `Bearer ${aliceToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].title).toBe('Fix login bug');
        });

        it('should return 403 if bob tries to get alice cards', async () => {
            const res = await request(app.getHttpServer())
                .get(`/api/lists/${aliceListId}/cards`)
                .set('Authorization', `Bearer ${bobToken}`);

            expect(res.status).toBe(403);
        });
    });

    describe('GET /api/cards/:id', () => {
        it('should return a card', async () => {
            const res = await request(app.getHttpServer())
                .get(`/api/cards/${aliceCardId}`)
                .set('Authorization', `Bearer ${aliceToken}`);

            expect(res.status).toBe(200);
            expect(res.body.title).toBe('Fix login bug');
        });

        it('should return 403 if bob tries to get alice card', async () => {
            const res = await request(app.getHttpServer())
                .get(`/api/cards/${aliceCardId}`)
                .set('Authorization', `Bearer ${bobToken}`);

            expect(res.status).toBe(403);
        });

        it('should return 404 if card not found', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/cards/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${aliceToken}`);

            expect(res.status).toBe(404);
        });
    });

    describe('PATCH /api/cards/:id', () => {
        it('should update alice card', async () => {
            const res = await request(app.getHttpServer())
                .patch(`/api/cards/${aliceCardId}`)
                .set('Authorization', `Bearer ${aliceToken}`)
                .send({ title: 'Updated card' });

            expect(res.status).toBe(200);
            expect(res.body.title).toBe('Updated card');
        });

        it('should return 403 if bob tries to update alice card', async () => {
            const res = await request(app.getHttpServer())
                .patch(`/api/cards/${aliceCardId}`)
                .set('Authorization', `Bearer ${bobToken}`)
                .send({ title: 'Hacked' });

            expect(res.status).toBe(403);
        });

        it('should return 404 if card not found', async () => {
            const res = await request(app.getHttpServer())
                .patch('/api/cards/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${aliceToken}`)
                .send({ title: 'Updated' });

            expect(res.status).toBe(404);
        });

        it('should move card to another list owned by alice', async () => {
            const newListId = await createList(app, aliceToken, 'Alice In Progress');

            const res = await request(app.getHttpServer())
                .patch(`/api/cards/${aliceCardId}`)
                .set('Authorization', `Bearer ${aliceToken}`)
                .send({ listId: newListId });

            expect(res.status).toBe(200);
            expect(res.body.list.id).toBe(newListId);
        });

        it('should return 403 when moving card to a list owned by bob', async () => {
            const bobListId = await createList(app, bobToken, 'Bob Todo');

            const res = await request(app.getHttpServer())
                .patch(`/api/cards/${aliceCardId}`)
                .set('Authorization', `Bearer ${aliceToken}`)
                .send({ listId: bobListId });

            expect(res.status).toBe(403);
        });
    });

    describe('DELETE /api/cards/:id', () => {
        it('should return 403 if bob tries to delete alice card', async () => {
            const res = await request(app.getHttpServer())
                .delete(`/api/cards/${aliceCardId}`)
                .set('Authorization', `Bearer ${bobToken}`);

            expect(res.status).toBe(403);
        });

        it('should delete alice card', async () => {
            const res = await request(app.getHttpServer())
                .delete(`/api/cards/${aliceCardId}`)
                .set('Authorization', `Bearer ${aliceToken}`);

            expect(res.status).toBe(204);
        });

        it('should return 404 after deletion', async () => {
            const res = await request(app.getHttpServer())
                .get(`/api/cards/${aliceCardId}`)
                .set('Authorization', `Bearer ${aliceToken}`);

            expect(res.status).toBe(404);
        });
    });
});