# Real-time Task Management System

A collaborative project and task management application featuring real-time updates, secure authentication, and a modern UI.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, CSS Modules (Vanilla), Socket.io Client
- **Backend**: Node.js, Express, TypeScript, Socket.io, Prisma ORM
- **Database**: PostgreSQL (via Docker)
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

- Node.js (v18+)
- Docker & Docker Compose

## Setup Instructions

### 1. Database Setup

Start the PostgreSQL service using Docker Compose:

```bash
docker-compose up -d
```

This will spin up a PostgreSQL container on port `5433` (mapped to internal `5432`).

### 2. Backend Setup

Navigate to the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Run database migrations to set up the schema:

```bash
npm run migrate
```

Start the development server:

```bash
npm run dev
```

The backend API will run on `http://localhost:3000`.

### 3. Frontend Setup

Navigate to the client directory:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Access the application at `http://localhost:5173`.

## Features

- **Authentication**: Secure Register and Login with JWT. Protected routes ensure data privacy.
- **Projects**: Create and manage multiple projects. View project teams and stats.
- **Tasks**: Full CRUD for tasks within projects. Assign tasks to members and update status (Todo, In Progress, Done).
- **Real-time Updates**: Changes to tasks (creation, updates, deletion) are reflected instantly for all users viewing the project.
- **Comments**: Real-time discussion on tasks. Users can add and delete their own comments.
- **Dashboard**: Overview of all your projects.

## Project Structure

- `client/`: React frontend application.
- `server/`: Node.js Express API and Socket.io server.
- `docker-compose.yml`: Database configuration.
