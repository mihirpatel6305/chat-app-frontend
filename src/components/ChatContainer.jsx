import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../context/SocketContext";
import { useEffect, useRef, useState } from "react";
import {
  addMessage,
  addPrevMessage,
  setMessages,
} from "../feature/messageSlice";
import formatDateString from "../services/formatDateString";
import formatTime from "../services/formatTime";
import Loader from "./Loader";
import ChatImageSkeleton from "./ChatImageSkeleton";

function ChatContainer({ isTyping, selectedUser }) {
  const [loadingPrev, setLoadingPrev] = useState(false);
  const [before, setBefore] = useState(() => new Date());
  const loggedInUser = useSelector((state) => state.user.currentUser);
  const loggedInUserId = loggedInUser?._id;
  const socket = useSocket();
  const dispatch = useDispatch();
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const messages = useSelector(
    (state) => state.messages?.messages[selectedUser?._id] || []
  );

  // For handling new messaages from receiver
  useEffect(() => {
    if (!socket || !selectedUser?._id || !loggedInUserId) return;

    const handleMessage = (message) => {
      dispatch(
        addMessage({
          receiverId: message.senderId,
          message,
        })
      );
    };

    socket.on("message", handleMessage);
    socket.emit("active", {
      senderId: loggedInUserId,
      receiverId: selectedUser?._id,
    });

    return () => {
      socket.off("message", handleMessage);
      socket.emit("inActive", {
        senderId: loggedInUserId,
      });
    };
  }, [socket, socket?.connected, selectedUser?._id, loggedInUserId]);

  // Fetching initial messages
  useEffect(() => {
    if (!socket || !selectedUser?._id || !loggedInUserId) return;
    socket.emit("getInitialMessages", {
      senderId: loggedInUserId,
      receiverId: selectedUser?._id,
    });

    socket.on("getInitialMessages", (messages) => {
      dispatch(setMessages({ receiverId: selectedUser?._id, messages }));
      setBefore(messages[messages?.length - 1]?.createdAt);
    });
  }, [loggedInUserId, selectedUser?._id, loggedInUserId]);

  // For Prev Messages fetch
  function fetchMoreData() {
    if (loadingPrev) return;
    setLoadingPrev(true);
    socket.emit("getPrevMessages", {
      senderId: loggedInUserId,
      receiverId: selectedUser?._id,
      before,
    });
  }
  // Trigger fetching enent of previous messages when the user scrolls to the top
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop === 0) {
        fetchMoreData();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [before]);

  // For Adding Previous messages in Redux store
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handlePrevMessages = (messages) => {
      const prevScrollHeight = container.scrollHeight;

      if (Array.isArray(messages) && messages.length > 0) {
        dispatch(addPrevMessage({ receiverId: selectedUser?._id, messages }));
        setBefore(messages[messages?.length - 1]?.createdAt);
      }

      // Stop loader
      setLoadingPrev(false);

      // timeout is wait for adding new message at top.
      setTimeout(() => {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - prevScrollHeight;
      }, 0);
    };

    socket.on("getPrevMessages", handlePrevMessages);

    return () => {
      socket.off("getPrevMessages", handlePrevMessages);
    };
  }, [socket, dispatch, selectedUser?._id]);

  // For smooth scorll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // for upcoming image message
  useEffect(() => {
    const handleImageMessage = (newImageMessage) => {
      dispatch(
        addMessage({
          receiverId: newImageMessage.senderId,
          message: newImageMessage,
        })
      );
    };

    socket.on("imageMessage", handleImageMessage);

    return () => {
      socket.off("imageMessage", handleImageMessage);
    };
  }, [socket, dispatch]);

  // Connection in backend in contoller for image
  useEffect(() => {
    if (!loggedInUserId) return;
    socket.emit("user_connected", loggedInUserId);
  }, [loggedInUserId]);

  return (
    <div
      ref={chatContainerRef}
      style={{ scrollbarWidth: "none" }}
      className="flex-1 overflow-y-auto p-4 space-y-2"
    >
      {loadingPrev && (
        <div className="max-h-80">
          <Loader />
        </div>
      )}

      {messages.map((msg, i) => {
        const isSender = msg?.senderId === loggedInUserId;
        const currentDate = formatDateString(msg.createdAt);
        const prevDate = formatDateString(messages[i - 1]?.createdAt);

        const isFirstUnread =
          msg.isUnread && !messages.slice(0, i).some((m) => m.isUnread);

        return (
          <div key={i}>
            {(i === 0 || currentDate !== prevDate) && currentDate && (
              <div className="text-center text-gray-500 text-sm my-2">
                {currentDate}
              </div>
            )}

            {isFirstUnread && loggedInUserId != msg?.senderId && (
              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-green-300"></div>
                <span className="mx-4 text-green-500 text-sm font-medium">
                  New messages
                </span>
                <div className="flex-grow border-t border-green-300"></div>
              </div>
            )}

            <div
              className={`flex ${
                isSender ? "justify-end" : "justify-start"
              } mb-2`}
            >
              <div
                className={`max-w-[70%] px-3 py-2 rounded-lg text-sm leading-snug ${
                  isSender
                    ? "bg-green-200 text-gray-900 rounded-bl-lg rounded-tr-none"
                    : "bg-gray-200 text-gray-900 rounded-br-lg rounded-tl-none"
                }`}
              >
                <div
                  className={`flex items-end gap-2 ${
                    msg?.image || msg?.skeleton ? "flex-col" : ""
                  }`}
                >
                  {msg?.skeleton ? (
                    <ChatImageSkeleton />
                  ) : msg?.image ? (
                    <img
                      src={msg.image}
                      alt="chat image"
                      className="max-w-[200px] max-h-[300px] rounded-lg"
                    />
                  ) : (
                    <span className="break-words">{msg.text}</span>
                  )}

                  <span className="text-[10px] text-gray-500 whitespace-nowrap">
                    {msg?.createdAt
                      ? formatTime(msg?.createdAt)
                      : formatTime(new Date())}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {isTyping && (
        <div className="flex items-center gap-1 px-2 pt-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-gray-600"
              style={{
                display: "inline-block",
                animation: "typingDots 1s infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            ></span>
          ))}
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

export default ChatContainer;
