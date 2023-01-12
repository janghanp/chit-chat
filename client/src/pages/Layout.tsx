import axios from "axios";
import { useEffect, useState } from "react";
import { Outlet, Link } from "react-router-dom";

import { Chat } from "../types";
import useAuth from "../hooks/useAuth";
import { useUser } from "../context/UserContext";
import defaultAvatar from "/default.jpg";

// TODO: How to update chats whene a user joins or leaves a chat room.
// Put the chats data into the AuthContext.
const Layout = () => {
  const auth = useAuth();

  const { currentUser } = useUser();

  const [chats, steChats] = useState<Chat[]>([]);

  useEffect(() => {
    const fetchChats = async () => {
      const { data } = await axios.get("http://localhost:8080/user/chats", { withCredentials: true });

      const chtasIdName = data.chats.map((chat: any) => {
        return { id: chat.id, name: chat.name };
      });

      steChats(chtasIdName);
    };

    fetchChats();
  }, []);

  return (
    <div className="drawer drawer-mobile">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-start border">
        {/* <!-- Page content here --> */}
        <Outlet />
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
        {/* <!-- Sidebar content here --> */}
        <ul className="menu p-4 w-80 bg-base-100 text-base-content flex flex-col justify-between">
          {/* Room list */}
          <div>
            {chats &&
              chats.map((chat) => {
                return (
                  <li key={chat.id}>
                    <Link to={`/chat/${chat.name}`}>{chat.name}</Link>
                  </li>
                );
              })}
          </div>

          {/* User Info */}
          {currentUser.email && (
            <div>
              <img className="border" src={currentUser.avatar || defaultAvatar} width={50} height={50} />
              <button
                className="border w-full"
                onClick={() => {
                  auth.logout();
                  window.location.reload();
                }}
              >
                Log out
              </button>
              <Link to="/settings">
                <button className="border w-full">config</button>
              </Link>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Layout;
