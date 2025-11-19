# Short.ly - URL Shortener

A fast, reliable, and containerized URL shortener service built with Node.js, Express, TypeScript, PostgreSQL, and Redis.

## Features

- **URL Shortening**: Convert long URLs into short, manageable links.
- **Custom Codes**: Option to specify a custom alias for your URL.
- **Redirection**: Fast redirection to the original URL.
- **Analytics**: Track click counts and last access time.
- **Rate Limiting**: Redis-based rate limiting to prevent abuse.
- **Dockerized**: Easy deployment with Docker Compose.
- **Web Interface**: Simple frontend to shorten URLs easily.

## Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine.

## Getting Started

1.  **Clone the repository** (if applicable) or navigate to the project directory.

2.  **Start the application**:
    ```bash
    docker compose up --build
    ```
    This command will:
    - Build the Node.js application image.
    - Start PostgreSQL and Redis containers.
    - Run database migrations (via `prisma db push`).
    - Start the application server.

3.  **Access the application**:
    - Web Interface: [http://localhost:3000](http://localhost:3000)
    - API: `http://localhost:3000/api`

## API Endpoints

### 1. Shorten URL
**POST** `/api/shorten`

Body:
```json
{
  "long_url": "https://example.com/very/long/url",
  "custom_code": "optional-alias"
}
```

Response:
```json
{
  "short_url": "http://localhost:3000/optional-alias"
}
```

### 2. List All Links
**GET** `/api/links`

Response:
```json
[
  {
    "short_code": "alias",
    "long_url": "https://example.com",
    "click_count": 5,
    "created_at": "2023-10-27T10:00:00.000Z",
    "last_clicked_at": "2023-10-27T12:00:00.000Z"
  }
]
```

### 3. Get Stats
**GET** `/api/stats/:shortCode`

Response:
```json
{
  "short_code": "optional-alias",
  "long_url": "https://example.com/very/long/url",
  "click_count": 42,
  "created_at": "2023-10-27T10:00:00.000Z",
  "last_clicked_at": "2023-10-27T12:00:00.000Z"
}
```

### 3. Redirect
**GET** `/:shortCode`

Redirects to the original `long_url`.

## Project Structure

- `src/`: Source code for the backend.
    - `server.ts`: Entry point and server configuration.
    - `routes.ts`: API route definitions.
    - `controllers.ts`: Request handlers and business logic.
    - `middleware/`: Middleware functions (e.g., rate limiting).
- `public/`: Static frontend files (`index.html`, `style.css`, `script.js`).
- `prisma/`: Database schema and migrations.
- `Dockerfile`: Docker image configuration.
- `docker-compose.yml`: Docker services configuration.

## Technologies

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Caching/Rate Limiting**: Redis
- **Containerization**: Docker
