import { createContext, useContext, useEffect } from "react";
import socket from "../services/socketService";
import { Outlet } from "react-router-dom";

const SocketContext = createContext(null);

export function SocketProvider() {
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("token");
    if (!isLoggedIn) return;

    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);
  return (
    <SocketContext.Provider value={socket}>
      <Outlet />
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
