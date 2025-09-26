import { useEffect, useState } from "react";
import { getAllUsers } from "../api/user";
import UsersList from "../components/UsersList";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../context/SocketContext";
import { setAllUser, setOnlineUser } from "../feature/userSlice";
import { getUnreadCount } from "../api/messages";
import addUnreadCount from "../services/addUnreadCount";
import Loader from "../components/Loader";

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
    navigate("/login");
  };

  //fetching Unread Count data here
  useEffect(() => {
    async function fetchUnreadCounts() {
      try {
        if (loggedInUserId) {
          const counts = await getUnreadCount(loggedInUserId);
          setUnreadCounts(counts || []);
        }
      } catch (error) {
        console.error("Error fetching Unread counts>>", error);
      }
    }
    fetchUnreadCounts();
  }, [loggedInUserId]);

  // Set online user in redux from backend
  useEffect(() => {
    socket.on("onlineUsers", (onlineUsers) => {
      dispatch(setOnlineUser(onlineUsers));
    });
  }, []);

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
        const allUser = await getAllUsers();
        dispatch(setAllUser(allUser));
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("Error in fetching User List");
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg flex flex-col h-[80vh]">
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

        <div className="flex-1 overflow-y-auto">
          {isLoading ? <Loader /> : <UsersList users={filteredUsers} />}
        </div>
      </div>
      {isOpenLogout && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
            <p className="mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsOpenLogout(false)}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
