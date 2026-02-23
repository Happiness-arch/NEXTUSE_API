## Docker Setup for NEXTUSE_API

This document explains how to run the NEXTUSE backend using Docker and what configuration is required.

### Prerequisites

- Docker Desktop (Windows/macOS) or Docker Engine (Linux)
- Docker Compose (included in Docker Desktop, or `docker-compose` / `docker compose` on Linux)

### Environment Variables

From `server.js` and `src/config/db.js`, the app expects:

- `MONGO_URI` – MongoDB connection string
- `JWT_SECRET` – secret used to sign JWTs
- `PORT` – port the API listens on (defaults to `8000`)
- `NODE_ENV` – `development` or `production`

There is a `.env.example` file in the repo. To create your local `.env`:

```bash
cp .env.example .env
```

Then edit `.env` and fill in real values. **Do not commit** `.env` to Git.

### Running with Docker Compose (Local Dev)

The `docker-compose.yml` file defines:

- `mongodb` service (MongoDB database)
- `node` service (NEXTUSE API)

From the project root, run:

```bash
docker-compose up --build
```

This will:

- Build the Node.js image from the `Dockerfile`
- Start MongoDB
- Start the API on port `8000`

You can then access the API at:

- `http://localhost:8000/`

To stop the services:

```bash
docker-compose down
```

### Dockerfile Overview

The `Dockerfile`:

- Uses `node:18-alpine` as the base image
- Sets `WORKDIR /app`
- Copies `package*.json` and runs `npm install`
- Copies the rest of the source code
- Exposes port `8000`
- Starts the app with:

```bash
node server.js
```

### High-Level Render Deployment

For deployment to Render:

1. Push your changes (including `Dockerfile`, `docker-compose.yml`, and `.env.example`) to GitHub  
2. In Render, create a **Web Service** and connect it to this GitHub repo  
3. Set `MONGO_URI`, `JWT_SECRET`, `PORT`, and `NODE_ENV` in Render’s Environment settings  
4. Trigger a deploy; Render will build and run the app using the `Dockerfile`

Secrets must be stored in Render, not in the repository.

### Troubleshooting

- **Node container fails**:  
  - Check logs: `docker-compose logs node`  
  - Verify `MONGO_URI` and `JWT_SECRET` are set

- **Mongo connection errors**:  
  - Ensure `MONGO_URI` uses `mongodb` as the host when running under Docker Compose

- **Port already in use**:  
  - Make sure nothing else is listening on `8000`

This setup allows you and your teammates (including on Windows) to run the backend with a single Docker command and present a clean Docker story for your capstone.