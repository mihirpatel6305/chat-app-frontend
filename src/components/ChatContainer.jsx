import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../context/SocketContext";
import { useEffect, useRef, useState } from "react";
import {
  addMessage,
  addPrevMessage,
  setMessages,
  updateMsgStatusDelivered,
  updateMsgStatusSeen,
  updateMsgStatusSent,
} from "../feature/messageSlice";
import formatDateString from "../services/formatDateString";
import formatTime from "../services/formatTime";
import Loader from "./Loader";
import ChatImageSkeleton from "./ChatImageSkeleton";
import CircularProgressBar from "./CircularProgressBar";
import doodle from "../assets/doodle.jpg";
import chat from "../assets/chat.svg";
import singleTick from "../assets/singleTick.svg";
import singleTickWhite from "../assets/singleTickWhite.svg";
import doubleTick from "../assets/doubleTick.svg";
import doubleTickWhite from "../assets/doubleTickWhite.svg";
import blueTick from "../assets/blueTick.svg";
import pending from "../assets/pending.svg";
import ShowImageModal from "./ShowImageModal";

function ChatContainer({ isTyping, selectedUser, uploadImageProgress }) {
  const [loadingPrev, setLoadingPrev] = useState(false);
  const [before, setBefore] = useState(() => new Date());
  const [showImage, setShowImage] = useState({ isOpen: false, image: "" });
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
      socket.emit("message_seen", message);
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
      socket.emit("message_seen", newImageMessage);
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

  // For handling message status
  useEffect(() => {
    socket.on("message_sent", (serverMessage) => {
      dispatch(
        updateMsgStatusSent({
          tempId: serverMessage?.tempId,
          newMessage: serverMessage?._doc,
        })
      );
    });

    socket.on("message_delivered", (message) => {
      dispatch(updateMsgStatusDelivered(message));
    });

    socket.on("message_seen", (message) => {
      dispatch(updateMsgStatusSeen(message));
    });
  }, [socket]);

  return (
    <div
      ref={chatContainerRef}
      className="relative flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-br from-green-50 to-white"
      style={{
        scrollbarWidth: "none",
        backgroundImage: `linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.95)), url(${doodle})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {messages && messages.length == 0 ? (
        <>
          <div className="w-full h-full flex flex-col items-center justify-center ">
            <div className="mb-6">
              <img src={`${chat}`} alt="Chat Icon" />
            </div>

            <h1 className="text-center">
              <span className="block text-3xl font-bold text-green-900">
                Start Chat With
              </span>
              <span className="block text-5xl font-bold text-gray-800 mt-2">
                {selectedUser?.name}
              </span>
            </h1>

            <p className="mt-4 text-gray-600 text-center max-w-xs">
              Say something to break the ice and get chatting!
            </p>
          </div>
        </>
      ) : (
        <div>
          {" "}
          {loadingPrev && (
            <div className="max-h-80">
              <Loader />
            </div>
          )}
          {messages.map((msg, i) => {
            const isSender = msg?.senderId === loggedInUserId;

            const currentDate = formatDateString(msg.createdAt);
            const prevDate = formatDateString(messages[i - 1]?.createdAt);
            const showDate = i === 0 || currentDate !== prevDate;

            return (
              <div key={i}>
                {showDate && (
                  <div className="text-center text-gray-500 text-sm my-2">
                    {currentDate}
                  </div>
                )}
                <div
                  className={`flex ${
                    isSender ? "justify-end" : "justify-start"
                  } mb-2`}
                >
                  <div
                    className={`max-w-[70%] px-2 py-2 rounded-xl text-sm leading-snug ${
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
                        <div className="relative">
                          <ChatImageSkeleton />
                          <div className="absolute inset-0 flex justify-center items-center">
                            <CircularProgressBar
                              uploadImageProgress={uploadImageProgress}
                            />
                          </div>
                        </div>
                      ) : msg?.image ? (
                        <div className="relative w-full max-w-[200px] max-h-[300px] rounded-lg overflow-hidden cursor-pointer">
                          <img
                            src={msg.image}
                            alt="chat image"
                            className="w-full h-full object-cover"
                            onClick={() => {
                              setShowImage((prev) => ({
                                ...prev,
                                isOpen: true,
                                image: msg?.image,
                              }));
                            }}
                            onLoad={() => {
                              if (i === messages.length - 1) {
                                messagesEndRef.current?.scrollIntoView({
                                  behavior: "smooth",
                                });
                              }
                            }}
                          />
                          {/* Status for image */}
                          <div className="absolute bottom-1 right-1 flex items-center gap-1">
                            <span className="text-[10px] text-white whitespace-nowrap leading-none">
                              {msg?.createdAt
                                ? formatTime(msg?.createdAt)
                                : formatTime(new Date())}
                            </span>
                            {isSender && (
                              <img
                                src={
                                  msg?.status === "sent"
                                    ? singleTickWhite
                                    : msg?.status === "delivered"
                                    ? doubleTickWhite
                                    : msg?.status === "seen"
                                    ? blueTick
                                    : pending
                                }
                                alt={msg?.status}
                                className="w-3 h-3"
                              />
                            )}
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`relative max-w-[300px] ${
                            msg.text.length < 20
                              ? "inline-flex items-end gap-1"
                              : ""
                          }`}
                        >
                          <span
                            className={`break-words ${
                              msg.text.length < 20 ? "pr-1" : "block w-full"
                            }`}
                            style={{ whiteSpace: "pre-wrap" }}
                          >
                            {msg.text.replace(/\n+$/g, "")}
                          </span>

                          {/* Status for text */}
                          <div
                            className={`flex items-center gap-1 text-[10px] text-gray-500 ${
                              msg.text.length < 20 ? "" : "mt-1 justify-end"
                            }`}
                          >
                            <span>
                              {msg?.createdAt
                                ? formatTime(msg?.createdAt)
                                : formatTime(new Date())}
                            </span>
                            {isSender && (
                              <img
                                src={
                                  msg?.status === "sent"
                                    ? singleTick
                                    : msg?.status === "delivered"
                                    ? doubleTick
                                    : msg?.status === "seen"
                                    ? blueTick
                                    : pending
                                }
                                alt={msg?.status}
                                className="w-3 h-3"
                              />
                            )}
                          </div>
                        </div>
                      )}
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
      )}
      {showImage.isOpen && (
        <ShowImageModal
          showImage={showImage}
          onClose={() => setShowImage({ isOpen: false, image: "" })}
        />
      )}
    </div>
  );
}

export default ChatContainer;
