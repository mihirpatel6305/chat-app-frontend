import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true, // important if you later use cookies/auth
});

export default socket;
