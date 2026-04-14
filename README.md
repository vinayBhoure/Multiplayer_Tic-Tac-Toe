# Multiplayer Tic-Tac-Toe (Nakama & React)

A premium, server-authoritative multiplayer Tic-Tac-Toe game built with **Nakama** and **React**.

## 🚀 Features
- **Server-Authoritative**: Game logic runs entirely on the Nakama server.
- **Real-Time Synergy**: Low-latency gameplay via WebSockets.
- **Multiplayer Matchmaking**: Automatic pairing of players.
- **Premium Design**: Modern UI with sleek dark mode and smooth animations.

## 🛠️ Tech Stack
- **Backend**: Nakama Server (Authoritative Match Handler)
- **Database**: PostgreSQL
- **Frontend**: React (Vite), Tailwind CSS, Zustand
- **Communication**: @heroiclabs/nakama-js

## 📦 Project Structure
- `backend/`: Docker setup and Nakama configuration.
- `frontend/`: React application and state management.

## 🏁 Quick Start

### 1. Prerequisites
- Docker & Docker Compose
- Node.js (v20+)

### 2. Run Backend
```bash
cd backend
docker-compose up -d
```
Access Nakama Console at `http://localhost:7351` (admin/password).

### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

## 🧪 Deployment
- **Backend**: AWS / Cloud VM
- **Frontend**: Vercel

## 📄 License
MIT
