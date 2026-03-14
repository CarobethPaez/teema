<div align="center">

# 📋 Real-time Task Management System

**A full-stack collaborative project management app with real-time updates, JWT authentication, and a modern UI.**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)

![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)
![Status](https://img.shields.io/badge/status-active-success?style=flat-square)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Live Dashboard** | Real-time stats: total, pending, and completed tasks across all projects |
| 🔄 **Real-time Updates** | Instant sync for all connected users via Socket.io |
| 💬 **Task Comments** | Real-time discussion threads on individual tasks |
| 🗂️ **Project Management** | Create projects, manage teams, track progress |
| ✅ **Full Task CRUD** | Create, assign, update status (Todo → In Progress → Done) and delete tasks |
| 🔐 **Secure Auth** | JWT-based authentication with protected routes |
| 📡 **Activity Feed** | Live stream of the latest updates across all projects |

---

## 🧱 Tech Stack

### Frontend
- **React** + **TypeScript** — component-based UI with type safety
- **Vite** — lightning-fast dev server and bundler
- **CSS Modules (Vanilla)** — scoped, maintainable styling
- **Socket.io Client** — real-time communication layer

### Backend
- **Node.js** + **Express** + **TypeScript** — REST API server
- **Socket.io** — WebSocket event handling
- **Prisma ORM** — type-safe database access
- **JWT** — stateless authentication

### Infrastructure
- **PostgreSQL** — relational database
- **Docker & Docker Compose** — containerized database setup

---

## 🚀 Getting Started

### Prerequisites

- ![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=nodedotjs&logoColor=white)
- ![Docker](https://img.shields.io/badge/Docker-required-2CA5E0?style=flat-square&logo=docker&logoColor=white)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. Configure environment variables

Create a `.env` file in the root or `server/` directory:

```env
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5433/taskmanager?schema=public"
PORT=3000
JWT_SECRET=your_jwt_secret_key
```

### 3. Start the database

```bash
docker-compose up -d
```

> Spins up a PostgreSQL container on port `5433`.

### 4. Set up the backend

```bash
cd server
npm install
npm run migrate   # Apply Prisma migrations
npm run dev       # Start API server on http://localhost:3000
```

### 5. Set up the frontend

```bash
cd client
npm install
npm run dev       # Start Vite dev server on http://localhost:5173
```

---

## 📁 Project Structure

```
├── client/              # React + TypeScript frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route-level views
│   │   └── ...
├── server/              # Node.js + Express API
│   ├── src/
│   │   ├── routes/      # REST endpoints
│   │   ├── prisma/      # Schema & migrations
│   │   └── ...
└── docker-compose.yml   # PostgreSQL container config
```

---

## 🔌 Real-time Architecture

```
Client A  ──┐
             ├──▶  Socket.io Server  ──▶  Broadcasts to all clients
Client B  ──┘         │
                       │
                   PostgreSQL
```

Task events (create, update, delete) are emitted through Socket.io and instantly reflected in every connected client's UI — no polling required.

---

## 📝 Notes

> The application currently features a multilingual interface with core components in **English** and dashboard labels in **Spanish**.

---

<div align="center">

Made with ❤️ using React, Node.js & Socket.io

</div>
