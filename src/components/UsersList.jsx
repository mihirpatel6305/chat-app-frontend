import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useEffect, useState } from "react";

function UsersList({ users }) {
  const [userList, setUserList] = useState(users || []);
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    setUserList(users || []);
  }, [users]);

  // Update userList on new Message
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (message) => {
      setUserList((prevUsers) =>
        prevUsers.map((user) => {
          if (user?._id === message?.senderId) {
            return {
              ...user,
              unreadCount: (user?.unreadCount || 0) + 1,
            };
          }
          return user;
        })
      );
      socket.emit("message_delivered", message);
    };

    socket.on("message", handleIncomingMessage);
    socket.on("imageMessage", handleIncomingMessage);

    return () => {
      socket.off("message", handleIncomingMessage);
      socket.off("imageMessage", handleIncomingMessage);
    };
  }, [socket]);

  // Showing typing indicator in UserList
  useEffect(() => {
    socket.on("start_typing", ({ senderId }) => {
      setUserList((prevUsers) => {
        return prevUsers.map((user) => {
          return user._id === senderId ? { ...user, isTyping: true } : user;
        });
      });
    });

    socket.on("stop_typing", ({ senderId }) => {
      setUserList((prevUsers) => {
        return prevUsers.map((user) => {
          return user._id === senderId ? { ...user, isTyping: false } : user;
        });
      });
    });

    return () => {
      socket.off("start_typing");
      socket.off("stop_typing");
    };
  }, []);

  if (!users || users.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-lg font-medium bg-gray-100 rounded-md shadow-sm">
        No users available
      </div>
    );
  }

  return (
    <div className="overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <ul>
        {userList.map((user) => (
          <li
            key={user._id}
            className="flex items-center gap-3 p-3 rounded-md mb-1 cursor-pointer hover:bg-gray-200 transition relative"
            onClick={() => navigate(`/chat/${user?._id}`)}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-xl">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              {user?.isOnline && (
                <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
              )}
            </div>

            <div className="flex flex-col flex-1">
              <span className="font-medium text-gray-800">{user?.name}</span>
              <span className="text-sm text-gray-500">
                {user.isTyping ? (
                  <span className="text-green-600 font-medium">typing...</span>
                ) : user?.isOnline ? (
                  <span className="text-green-600 font-bold">Online</span>
                ) : (
                  "Offline"
                )}
              </span>
            </div>
            {user?.unreadCount !== undefined && user?.unreadCount > 0 && (
              <span className="ml-auto px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded-full">
                {user.unreadCount}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UsersList;
