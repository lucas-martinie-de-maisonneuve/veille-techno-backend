# Veille Technologique Backend

A REST API for a Kanban Board application built with NestJS, TypeORM and PostgreSQL.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Documentation**: Swagger

## Why NestJS ?

NestJS is a progressive Node.js framework built with TypeScript natively. 
Its opinionated structure (modules, controllers, services) makes it easy to 
scale and maintain, while its decorator-based syntax is familiar to developers 
coming from Angular or Spring Boot.

## Why npm over yarn/pnpm ?

npm is the default package manager for Node.js, widely adopted and stable. 
For a project of this scale, it offers everything needed without adding 
extra tooling complexity.

## Why CJS over ESM ?

NestJS is built on CommonJS. While ESM is the modern standard, it introduces 
friction with Jest, TypeORM and several NestJS packages. CJS ensures full 
compatibility out of the box.

## Prerequisites

- Node.js v20+
- npm
- PostgreSQL 16+
- Docker & Docker Compose (optional)

## Installation

```bash
git clone https://github.com/lucas-martinie-de-maisonneuve/veille-techno-backend.git
cd veille-techno-backend
npm install
```

## Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | PostgreSQL user | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | - |
| `DB_NAME` | Database name | `kanban_board` |
| `JWT_SECRET` | Secret key for JWT | - |
| `PORT` | Application port | `3001` |

## Running the app

### Local

```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

### Docker

```bash
cp .env.example .env.docker
# Fill in .env.docker values
docker-compose up
```

> Local runs on port **3001**, Docker runs on port **3000**.