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
import send from "../assets/send.svg";

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

  function handleFileInputChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // image validation
    const allowedExtensions = ["jpg", "jpeg", "png", "gif"];

    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      toast.error("Only JPG, JPEG, PNG, and GIF files are allowed.");
      e.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    // size validation
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error("File size exceeds 5 MB. Please choose a smaller image.");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    setClosePreview(false);
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

      const tempId = Date.now();

      const message = {
        senderId: loggedInUserId,
        receiverId: selectedUser._id,
        text: input.trim(),
        createdAt: Date.now(),
        tempId,
        status: "sending",
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
      <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-2xl shadow-inner">
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
          className="flex-grow bg-white px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-200 shadow-sm resize-none"
        />

        <input
          type="file"
          accept=".jpg,.jpeg,.png,.gif"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current.click()}
          className="flex items-center justify-center cursor-pointer w-10 h-10 bg-gray-700 rounded-full hover:bg-gray-800 hover:scale-105 transition-transform shadow-sm"
          title="Attach image"
        >
          <img src={img} alt="upload" className="w-5 h-5 invert" />
        </button>

        <button
          onClick={handleSend}
          disabled={isSending}
          className={`flex items-center justify-center cursor-pointer w-10 h-10 rounded-full transition-all ${
            isSending
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-900 hover:bg-green-950"
          }`}
          title="Send message"
        >
          {isSending ? (
            <span className="text-sm text-white font-medium">...</span>
          ) : (
            <img src={send} alt="send" className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
