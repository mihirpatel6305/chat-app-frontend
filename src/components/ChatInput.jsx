import { useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";
import {
  addMessage,
  removeMessage,
  updateMessage,
} from "../feature/messageSlice";
import { useDispatch, useSelector } from "react-redux";
import { sendImageMessage } from "../api/messages";
import { toast } from "react-toastify";
import img from "../assets/imgSend.svg";

function ChatInput({ input, setInput, selectedUser, setUploadImageProgress }) {
  const socket = useSocket();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [closePreview, setClosePreview] = useState(true);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  const loggedInUser = useSelector((state) => state.user.currentUser);
  const loggedInUserId = loggedInUser?._id;

  // handle text input change
  function handleInputChange(e) {
    setInput(e.target.value);
    if (!isTypingRef.current) {
      socket.emit("start_typing", {
        senderId: loggedInUserId,
        receiverId: selectedUser._id,
      });
      isTypingRef.current = true;
    }

    // clear timeout for every change to reset timer
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", {
        senderId: loggedInUserId,
        receiverId: selectedUser._id,
      });
      isTypingRef.current = false;
    }, 1000);
  }

  // handling text and image send
  async function handleSend() {
    if (selectedFile) {
      const tempId = Date.now();
      setIsSending(true);
      try {
        setClosePreview(true);
        dispatch(
          addMessage({
            receiverId: selectedUser._id,
            message: {
              senderId: loggedInUserId,
              receiverId: selectedUser?._id,
              skeleton: true,
              tempId,
            },
          })
        );
        const res = await sendImageMessage(
          selectedUser._id,
          selectedFile,
          (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadImageProgress(percentCompleted);
          }
        );

        if (res?.data?.success) {
          const newMessage = res.data?.data?.newMessage;
          dispatch(
            updateMessage({
              receiverId: selectedUser._id,
              tempId,
              updates: { ...newMessage, skeleton: false },
            })
          );
          setUploadImageProgress(0);
        } else {
          dispatch(removeMessage({ receiverId: selectedUser._id, tempId }));
          toast.error(`Error: ${res.message}`);
        }

        setSelectedFile(null);
      } catch (error) {
        console.error("Error in Sending Image>>", error);
        toast.error("Failed to send image. Please try again.");
      } finally {
        setIsSending(false);
      }
    } else {
      if (!input.trim()) return;

      if (!socket || !socket.connected) {
        console.log("Socket is not connected yet!");
        toast.info("Connecting to server... Please wait.");
        return;
      }

      const message = {
        senderId: loggedInUserId,
        receiverId: selectedUser._id,
        text: input,
        createdAt: Date.now(),
      };

      socket.emit("message", message);

      dispatch(
        addMessage({
          receiverId: selectedUser?._id,
          message,
        })
      );

      setInput("");
    }
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {selectedFile && !closePreview && (
        <div className="relative w-32 h-32">
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="preview"
            className="w-full h-full object-cover rounded-md border"
          />
          <button
            onClick={() => setSelectedFile(null)}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600"
            title="Remove Image"
          >
            ×
          </button>
        </div>
      )}
      <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-full shadow-inner">
        {/* <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-grow bg-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-200 shadow-sm"
        /> */}

        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault(); // prevent newline
              handleSend();
            }
          }}
          style={{ scrollbarWidth: "none" }}
          className="flex-grow bg-white px-4 py-1 rounded-4xl focus:outline-none focus:ring-2 focus:ring-green-200 shadow-sm resize-none"
        />

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => {
            setSelectedFile(e.target.files[0]);
            setClosePreview(false);
          }}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current.click()}
          className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-green-500 rounded-full hover:bg-green-600 transition-colors"
          title="Select Image"
        >
          {/* <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white"
            fill="currentColor"
          >
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M18 20H4V6h9V4H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-9h-2v9zm-7.79-3.17l-1.96-2.36L5.5 18h11l-3.54-4.71zM20 4V1h-2v3h-3c.01.01 0 2 0 2h3v2.99c.01.01 2 0 2 0V6h3V4h-3z" />
          </svg> */}

          <img src={img} alt="img" className="w-6 h-6 invert" />
        </button>

        <button
          onClick={handleSend}
          disabled={isSending}
          className={`px-4 py-2 rounded-full text-white font-semibold transition-colors ${
            isSending
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
