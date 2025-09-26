import { useDispatch } from "react-redux";
import AllRoutes from "./routes/index";
import { getProfile } from "./api/user";
import { useEffect } from "react";
import { clearUser, setUser } from "./feature/userSlice";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getProfile(token)
        .then((user) => {
          dispatch(setUser(user));
        })
        .catch(() => {
          dispatch(clearUser());
          localStorage.removeItem("token");
        });
    }
  }, [dispatch]);

  return (
    <div>
      <AllRoutes />
    </div>
  );
}
export default App;
