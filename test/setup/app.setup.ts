import { INestApplication, ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { DataSource } from 'typeorm';

export interface TestApp {
    app: INestApplication;
    dataSource: DataSource;
}

export async function createTestApp(): Promise<TestApp> {
    process.env.NODE_ENV = 'test';
    process.env.DB_NAME = 'kanban_board_test';

    const moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    app.useGlobalFilters(new HttpExceptionFilter());

    const dataSource = moduleFixture.get(DataSource);
    await dataSource.query('TRUNCATE "users", "lists", "cards" RESTART IDENTITY CASCADE');

    await app.init();

    return { app, dataSource };
}

export async function closeTestApp(app: INestApplication, dataSource: DataSource): Promise<void> {
    await dataSource.query('TRUNCATE "users", "lists", "cards" RESTART IDENTITY CASCADE');
    await app.close();
}