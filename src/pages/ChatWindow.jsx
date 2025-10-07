import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import ChatInput from "../components/ChatInput";
import ChatContainer from "../components/ChatContainer";
import { setSelectedUser } from "../feature/userSlice";
import { getUserById } from "../api/user";
import { allMsgStatusSeen } from "../feature/messageSlice";

function ChatWindow() {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploadImageProgress, setUploadImageProgress] = useState(0);
  const socket = useSocket();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loggedInUser = useSelector((state) => state.user.currentUser);
  const loggedInUserId = loggedInUser?._id;

  const { id } = useParams();

  const selectedUserFromAllUsers = useSelector((state) =>
    state.user.allUsers.find((u) => u._id === id)
  );

  const selectedUserFromRedux = useSelector((state) => state.user.selectedUser);

  const selectedUser = selectedUserFromAllUsers || selectedUserFromRedux;

  // Fetching seleted user data on page reload
  useEffect(() => {
    async function fetchSelectedUser(id) {
      try {
        const data = await getUserById(id);
        if (data?.user) {
          dispatch(setSelectedUser(data.user));
        } else {
          console.warn("User not found");
        }
      } catch (error) {
        console.error("Error fetching selected user:", error);
      }
    }
    if (!selectedUser && id) {
      fetchSelectedUser(id);
    }
  }, [id, selectedUser?._id]);

  useEffect(() => {
    if (!socket || !loggedInUserId || !selectedUser?._id) return;

    // If user refresh this page then important to emit.
    socket.emit("user_connected", loggedInUserId);

    //  Re-register active chat if user was viewing someone’s chat
    socket.emit("active", {
      senderId: loggedInUserId,
      receiverId: selectedUser?._id,
    });

    // handle mark as read messages.
    socket.emit("mark_as_read", {
      userId: loggedInUserId,
      chatWithId: selectedUser._id,
    });

    socket.on("mark_as_read", ({ seenby }) => {
      dispatch(allMsgStatusSeen(seenby));
    });
  }, [socket, loggedInUserId, selectedUser?._id]);

  //For Typing... indicator
  useEffect(() => {
    socket.on("start_typing", ({ senderId }) => {
      if (senderId && senderId == selectedUser?._id) {
        setIsTyping(true);
      }
    });

    socket.on("stop_typing", ({ senderId }) => {
      if (senderId && senderId == selectedUser?._id) {
        setIsTyping(false);
      }
    });
    return () => {
      socket.off("start_typing");
      socket.off("stop_typing");
    };
  }, [selectedUser?._id]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg flex flex-col h-[80vh]">
        <div className="bg-green-900 text-white p-4 rounded-t-lg font-semibold flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-white font-bold text-xl"
          >
            ←
          </button>
          <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-950 font-bold">
            {selectedUser?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-lg">{selectedUser?.name}</span>
        </div>

        <ChatContainer
          isTyping={isTyping}
          selectedUser={selectedUser}
          uploadImageProgress={uploadImageProgress}
        />

        <div className="flex p-2 gap-2 border-t">
          <ChatInput
            input={input}
            setInput={setInput}
            selectedUser={selectedUser}
            setUploadImageProgress={setUploadImageProgress}
          />
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
