import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true, // important if you later use cookies/auth
});

export default socket;
