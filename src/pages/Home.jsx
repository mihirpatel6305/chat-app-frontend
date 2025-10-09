import { useEffect, useState } from "react";
import { getAllUsers } from "../api/user";
import UsersList from "../components/UsersList";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../context/SocketContext";
import {
  setAllUser,
  setOnlineUser,
  sortUserOnLastestMsg,
} from "../feature/userSlice";
import {
  fetchLatestMsgTime,
  getUnreadCount,
  setAllDelivered,
} from "../api/messages";
import addUnreadCount from "../services/addUnreadCount";
import Loader from "../components/Loader";
import LogoutModal from "../components/LogoutModal";
import { toast } from "react-toastify";
import doodle from "../assets/doodle.jpg";

function Home() {
  const [unreadCounts, setUnreadCounts] = useState([]);
  const [isOpenLogout, setIsOpenLogout] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const socket = useSocket();
  const dispatch = useDispatch();

  const loggedInUser = useSelector((state) => state.user.currentUser);
  const loggedInUserId = loggedInUser?._id;

  const users = useSelector((state) => state.user.allUsers);

  const onlineUsers = useSelector((state) => state.user.onlineUsers);
  const usersWithOnlineStatus = users.map((user) => ({
    ...user,
    isOnline: onlineUsers.includes(user._id),
  }));

  const usersWithUnreadCounts =
    unreadCounts.length > 0
      ? addUnreadCount(usersWithOnlineStatus, unreadCounts)
      : usersWithOnlineStatus;

  const filteredUsers = usersWithUnreadCounts.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    if (socket) {
      socket.emit("logout", loggedInUserId);
      socket.disconnect();
    }
    localStorage.removeItem("token");
    toast.success("You have been logged out successfully");
    navigate("/login");
  };

  // fetching Unread Count data here
  useEffect(() => {
    async function fetchUnreadCounts() {
      try {
        if (loggedInUserId) {
          // make all the message delivered and emit message_delivered event in backend
          await setAllDelivered();

          // fetching unread count
          const counts = await getUnreadCount(loggedInUserId);
          setUnreadCounts(counts || []);
        }
      } catch (error) {
        console.error("Error fetching Unread counts>>", error);
      }
    }
    fetchUnreadCounts();
  }, [loggedInUserId]);

  // fetch latest message time and push in redux store to sort User
  useEffect(() => {
    const fetchAndSortUserOnLatestMsg = async () => {
      try {
        const recentMsgData = await fetchLatestMsgTime();
        const latestMessages = recentMsgData?.data?.latestMessages || [];

        if (latestMessages.length > 0) {
          dispatch(sortUserOnLastestMsg(latestMessages));
        }
      } catch (error) {
        console.error("Error fetching latest messages:", error);
      }
    };

    if (users.length > 0) {
      fetchAndSortUserOnLatestMsg();
    }
  }, [dispatch, users]);

  // Set online user in redux from backend
  useEffect(() => {
    socket.on("onlineUsers", (onlineUsers) => {
      dispatch(setOnlineUser(onlineUsers));
    });

    socket.on("message", (message) => {
      if (message?.status !== "seen") {
        socket.emit("message_delivered", message);
      }
    });
  }, [socket]);

  // Connection response to backend
  useEffect(() => {
    if (!loggedInUserId) return;
    socket.emit("user_connected", loggedInUserId);
  }, [loggedInUserId]);

  // Fetch list of User here
  useEffect(() => {
    async function fetchUsers() {
      try {
        setIsLoading(true);
        const res = await getAllUsers();
        if (res?.data?.users) {
          dispatch(setAllUser(res.data.users));
        } else {
          console.warn("User is not set in redux");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Something wrong in refreshing User List");
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="flex justify-center items-center p-4 min-h-screen bg-gray-100">
      <div
        className="w-full max-w-md bg-white rounded-lg shadow-lg flex flex-col h-[80vh]"
        style={{
          scrollbarWidth: "none",
          backgroundImage: `linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.95)), url(${doodle})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="flex justify-between items-center p-5 bg-green-900 text-white rounded-t-lg">
          <h1 className="text-lg font-bold">Chat App</h1>
          <button
            onClick={() => setIsOpenLogout(true)}
            className="bg-red-500 px-3 py-1 rounded text-sm"
          >
            Logout
          </button>
        </div>

        <div className="p-3 border-b">
          <input
            type="text"
            placeholder="Search or start new chat"
            className="w-full p-2 rounded-md border border-gray-300 focus:outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {isLoading ? <Loader /> : <UsersList users={filteredUsers} />}
        </div>
      </div>
      {isOpenLogout && (
        <LogoutModal
          setIsOpenLogout={setIsOpenLogout}
          handleLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default Home;
