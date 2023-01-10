import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";

import { useAuth } from "../context/AuthContext";

const Home = () => {
  const auth = useAuth();

  const socketRef = useRef<Socket>();

  const [roomId, setRoomId] = useState<string>();

  const navigate = useNavigate();

  useEffect(() => {
    socketRef.current = io("http://localhost:8080");
  }, []);

  const joinRoom = () => {
    // Join a room.
    if (roomId) {
      socketRef.current?.emit("join_room", { username: auth.currentUser.username, roomId });
    }

    // Show a Chat room.
    navigate(`/chat/${roomId}`);
  };

  return (
    <div className="w-full h-full flex justify-center items-start p-5">
      <p>Welcome to chit-chat</p>
      <input className="border" type="text" onChange={(e) => setRoomId(e.target.value)} />
      <button onClick={joinRoom}>Join a room</button>
    </div>
  );
};

export default Home;
