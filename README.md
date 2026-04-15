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

### Backend (AWS EC2)
1. Transfer the `.backend` folder securely to your EC2 instance via SCP:
   `scp -i "your-key.pem" -r ./backend ec2-user@<EC2_PUBLIC_IP>:/home/ec2-user/backend`
2. SSH into your EC2 instance and install Docker/Compose if not already installed.
3. Bring up the server securely:
   ```bash
   cd backend
   docker-compose up -d
   ```
4. Expose **Port 7350** (Game Client Data) and **Port 7351** (Console) inside your AWS EC2 Security Group configurations.

### Frontend (Vercel)
1. Import the Git repository in Vercel.
2. In the "Environment Variables" section of the Vercel dashboard, populate:
   - `VITE_NAKAMA_HOST`: `<EC2_PUBLIC_IP>`
   - `VITE_NAKAMA_PORT`: `7350`
   - `VITE_NAKAMA_USE_SSL`: `false` (Unless deploying a reverse proxy on EC2)
3. Deploy!

## 📄 License
MIT
