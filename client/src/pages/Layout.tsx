import axios from 'axios';
import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

import { AuthErrorResponse } from '../types';
import useAuth from '../hooks/useAuth';
import { useUser } from '../context/UserContext';
import defaultAvatar from '/default.jpg';

const Layout = () => {
  const navigate = useNavigate();

  const auth = useAuth();

  const { currentUser } = useUser();

  const [roomName, setRoomName] = useState<string>('');
  const [toggleModal, setToggleModal] = useState<boolean>(false);

  const createChat = async () => {
    if (!roomName) {
      return;
    }

    // Check if a chat room to create already exists.
    try {
      await axios.post('http://localhost:8080/chat', { roomName: roomName }, { withCredentials: true });

      setToggleModal(false);

      // A chat room has been created and redirect a user to the Chat page.
      navigate(`/chat/${roomName}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        //Chat room already exists.
        const serverError = error.response.data as AuthErrorResponse;
        alert(serverError.message);
        return;
      } else if (error instanceof Error) {
        console.log(error);
      }

      return;
    } finally {
      setRoomName('');
    }
  };

  return (
    <>
      <div className="drawer drawer-mobile">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-center justify-start">
          {/* <!-- Page content here --> */}
          <Outlet />
        </div>
        <div className="drawer-side border-r">
          <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
          {/* <!-- Sidebar content here --> */}
          <ul className="menu p-4 w-80 bg-base-100 text-base-content flex flex-col justify-between">
            {/* Room list */}
            <div>
              {currentUser &&
                currentUser.chats &&
                currentUser.chats.map((chat) => {
                  return (
                    <li key={chat.id}>
                      <Link to={`/chat/${chat.name}`}>{chat.name}</Link>
                    </li>
                  );
                })}
            </div>

            {/* User Info */}
            {currentUser && currentUser.email && (
              <div>
                <button className="border p-2 rounded-md" onClick={() => setToggleModal(!toggleModal)}>
                  Creaet a chat
                </button>
                <img className="border" src={currentUser.avatar || defaultAvatar} width={50} height={50} alt="avatar" />
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

      {toggleModal && (
        <>
          <div
            className="fixed z-10 top-0 inset-0  flex justify-center items-center bg-black opacity-40"
            onClick={(e) => {
              e.stopPropagation();
              setToggleModal(false);
            }}
          ></div>
          <div className="fixed border z-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white">
            <label>Create a chat</label>
            <input className="border" type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
            <button onClick={createChat}>Creat a chat</button>
          </div>
        </>
      )}
    </>
  );
};

export default Layout;
