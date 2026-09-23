# Veille Technologique Backend

A REST API for a Kanban Board application built with NestJS, TypeORM and PostgreSQL.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Documentation**: Swagger

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
| `JWT_SECRET` | Secret key for JWT signing | - |
| `PEPPER` | Secret pepper for password hashing | - |
| `PORT` | Application port | `3001` |

### Generate JWT_SECRET and PEPPER

```bash
openssl rand -base64 32
```

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

## Project Structure

```
src/
├── auth/                       # Authentication module
│   ├── dto/                    # Data Transfer Objects
│   │   ├── register.dto.ts     # Register request validation
│   │   └── login.dto.ts        # Login request validation
│   ├── guards/                 # Route guards
│   │   └── jwt-auth.guard.ts   # JWT authentication guard
│   ├── strategies/             # Passport strategies
│   │   └── jwt.strategy.ts     # JWT token validation strategy
│   ├── auth.controller.ts      # Auth routes handler
│   ├── auth.module.ts          # Auth module definition
│   └── auth.service.ts         # Auth business logic
├── users/                      # Users module
│   ├── user.entity.ts          # User database entity
│   ├── users.controller.ts     # Users routes handler
│   ├── users.module.ts         # Users module definition
│   └── users.service.ts        # Users business logic
├── common/                     # Shared utilities
│   └── filters/
│       └── http-exception.filter.ts  # Global error handler
├── config/
│   └── env.validation.ts       # Environment variables validation
├── app.module.ts               # Root module
└── main.ts                     # Application entry point
```

## API Routes

### Authentication

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Login and get JWT token | ❌ |

### Users

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `GET` | `/api/users/me` | Get current user profile | ✅ |
| `PATCH` | `/api/users/:id` | Update user info and role | ✅ Admin |
| `DELETE` | `/api/users/:id` | Delete a user | ✅ Admin |

### Lists

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `GET` | `/api/lists` | Get all lists | ✅ |
| `POST` | `/api/lists` | Create a new list | ✅ |
| `PATCH` | `/api/lists/:id` | Update a list | ✅ Owner |
| `DELETE` | `/api/lists/:id` | Delete a list | ✅ Owner |

### Cards

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `GET` | `/api/lists/:listId/cards` | Get all cards of a list | ✅ |
| `GET` | `/api/cards/:id` | Get a single card | ✅ |
| `POST` | `/api/cards` | Create a new card | ✅ |
| `PATCH` | `/api/cards/:id` | Update a card | ✅ Owner |
| `DELETE` | `/api/cards/:id` | Delete a card | ✅ Owner |

## Security

### Authentication
- All protected routes require a valid **JWT Bearer token** in the `Authorization` header
- Tokens are signed with `JWT_SECRET` and expire after **24 hours**
- Tokens carry the user's `id`, `email` and `role`

### Password Security
- Passwords are hashed with **bcrypt** (10 salt rounds)
- A secret **pepper** is appended before hashing for extra security
- Passwords are **never** returned in any API response

### Authorization
- **Ownership**: users can only modify/delete their own resources
- **Admin role**: admins can modify/delete any resource and manage user roles
- Role verification is handled at the service level

### Input Validation
- All request bodies are validated via **DTOs** and `class-validator`
- Unknown fields are stripped automatically (`whitelist: true`)
- Invalid inputs return a `400 Bad Request` with detailed error messages

### Error Handling
- All errors are caught by a global **HttpExceptionFilter**
- Error responses follow a consistent format:

```json
{
  "statusCode": 404,
  "timestamp": "2026-09-22T12:00:00.000Z",
  "path": "/api/users/123",
  "message": "User not found",
  "error": "Not Found"
}
```

## API Documentation

Swagger UI is available at:

```
http://localhost:3001/api/docs
```