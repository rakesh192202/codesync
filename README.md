# CodeSync

CodeSync is a real-time collaborative coding platform that allows multiple users to join a shared coding room, collaborate through WebRTC, and execute Java code remotely.

The project is built to explore real-time communication, peer-to-peer collaboration, backend APIs, WebSocket signaling, WebRTC, and remote code execution.

## 🚀 Live Demo

Frontend:
https://codesync-navy.vercel.app

Backend:
https://codesync-backend-upn4.onrender.com

> The backend is hosted on Render's free tier, so the first request after inactivity may take longer because the service can spin down.

---

## ✨ Features

- Create collaborative coding rooms
- Join rooms using a room code
- Multiple users can join the same room
- Real-time user presence
- WebSocket-based signaling
- WebRTC peer-to-peer communication
- Real-time code sharing
- Java code execution
- PostgreSQL persistence
- REST APIs
- React-based frontend
- Spring Boot backend
- Responsive coding interface

---

## 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │      React / Vite    │
                    │      Frontend        │
                    │      (Vercel)        │
                    └──────────┬───────────┘
                               │
                     REST / WebSocket
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Spring Boot       │
                    │      Backend         │
                    │      (Render)        │
                    └───────┬───────┬──────┘
                            │       │
                         REST     WebSocket
                            │       │
                            ▼       ▼
                    ┌──────────┐  ┌──────────────┐
                    │PostgreSQL│  │ WebRTC       │
                    │ Database │  │ Signaling    │
                    └──────────┘  └──────┬───────┘
                                         │
                                  Peer-to-Peer
                                         │
                            ┌────────────┴────────────┐
                            │                         │
                         User 1                    User 2
