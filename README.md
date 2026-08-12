# CodeSync

**A real-time collaborative coding platform** — create a room, share a room code, and write Java code together with live synchronization over WebRTC, then execute it and see the output instantly.

Built to explore backend API design, WebSocket signaling, peer-to-peer communication with WebRTC, and remote code execution — end to end, from React frontend to a Spring Boot backend deployed in the cloud.

---

## 🚀 Live Demo

| | |
|---|---|
| **Frontend** | [codesync-navy.vercel.app](https://codesync-navy.vercel.app) |
| **Backend** | [codesync-backend-upn4.onrender.com](https://codesync-backend-upn4.onrender.com) |

> ⚠️ The backend runs on Render's free tier, which spins down after periods of inactivity. The first request after idle time may take longer while the instance wakes up.

---

## ✨ Features

- 🔑 Create a coding room and get a unique, shareable room code
- 👥 Join an existing room and see who else is connected in real time
- 🔌 WebSocket-based signaling for WebRTC connection setup (offer / answer / ICE candidate exchange)
- 🔄 Peer-to-peer WebRTC connection between users, once established
- ⌨️ Real-time Java code sharing between connected peers
- ▶️ Server-side Java code execution with output/error returned to the client
- 🗄️ Room and user data persisted with PostgreSQL via JPA/Hibernate
- 🌐 REST APIs for room creation, joining, and lookup
- ☁️ Fully deployed: React/Vite frontend on Vercel, Spring Boot backend on Render

---

## 🏗️ Architecture

```
                     ┌──────────────────────┐
                     │   React / Vite        │
                     │   Frontend (Vercel)   │
                     └──────────┬────────────┘
                                │
                     REST API   │   WebSocket (signaling)
                                │
                                ▼
                     ┌──────────────────────┐
                     │   Spring Boot         │
                     │   Backend (Render)    │
                     └───────┬───────┬───────┘
                             │       │
                          REST     WebSocket
                             │       │
                             ▼       ▼
                     ┌──────────┐  ┌────────────────┐
                     │PostgreSQL│  │ WebRTC Signaling│
                     │ Database │  │    Handler      │
                     └──────────┘  └────────┬────────┘
                                             │
                                     Peer-to-Peer (WebRTC)
                                             │
                              ┌──────────────┴──────────────┐
                              │                              │
                          Browser A                     Browser B
```

**Key design point:** WebSocket is used only for *signaling* — exchanging the connection metadata (offers, answers, ICE candidates) two browsers need to find each other. Once that handshake completes, code updates flow **directly peer-to-peer over a WebRTC DataChannel**, not through the server.

---

## 🛠️ Tech Stack

**Frontend**
- React + Vite
- WebRTC (`RTCPeerConnection`, DataChannel)
- Native WebSocket client

**Backend**
- Java + Spring Boot
- Spring WebSocket (signaling server)
- REST APIs
- JPA / Hibernate
- PostgreSQL

**Infrastructure**
- Frontend deployed on Vercel
- Backend deployed on Render
- Environment-based configuration for database credentials and CORS

---

## 📡 API Overview

### Room Management

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/rooms` | Create a new room |
| `POST` | `/api/rooms/{roomCode}/join` | Join an existing room |
| `GET` | `/api/rooms/{roomCode}` | Retrieve room details |

**Example — create a room:**
```
POST /api/rooms?roomName=TestRoom&username=Rakesh&language=java
```
```json
{
  "roomCode": "370853",
  "roomName": "TestRoom",
  "language": "java",
  "id": 1,
  "users": ["Rakesh"]
}
```

### Code Execution

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/execute` | Execute submitted Java code |

```json
{
  "language": "java",
  "code": "public class Main { public static void main(String[] args) { System.out.println(\"Hello\"); } }"
}
```

### WebSocket Signaling

```
wss://codesync-backend-upn4.onrender.com/ws/signaling?username={username}&roomCode={roomCode}
```

Signaling message types: `USER_LIST`, `OFFER`, `ANSWER`, `ICE_CANDIDATE`.

---

## 🖥️ Running Locally

**Backend**
```bash
cd codesync-backend
./mvnw spring-boot:run
```
Configure the following environment variables for your local PostgreSQL instance:
```
DB_URL=jdbc:postgresql://localhost:5432/codesync
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

**Frontend**
```bash
cd codesync-frontend
npm install
npm run dev
```
Set the backend URL in a `.env` file:
```
VITE_BACKEND_URL=http://localhost:8080
```

---

## ⚠️ Known Limitations

This project was built to learn and demonstrate core real-time and backend concepts — it is **not** a production-grade platform. Known constraints:

- Code execution uses `ProcessBuilder` directly with no sandboxing, timeout enforcement, or resource limits — it should not be exposed to untrusted public traffic as-is
- Only Java is currently supported
- No authentication or authorization layer
- Concurrent edits use a simple "last update wins" model rather than CRDT/Operational Transformation
- Free-tier hosting introduces cold-start delays after inactivity

## 🔭 Possible Future Improvements

- Docker-based sandboxing for code execution
- Execution timeouts and memory/CPU limits
- Multi-language support
- User authentication
- Cursor-position synchronization
- Persistent room history

---

## 👤 Author

**Rakesh Kumar**

- GitHub: [@rakesh192202](https://github.com/rakesh192202)
- LinkedIn: [linkedin.com/in/rakesh-kumar-2a0834295](https://linkedin.com/in/rakesh-kumar-2a0834295)
- Email: rakeshkrdss19@gmail.com

---

## 📄 License

This project is open source and available for learning purposes.
