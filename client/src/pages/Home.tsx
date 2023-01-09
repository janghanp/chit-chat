import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

const Home = () => {
  const socketRef = useRef<Socket>();

  useEffect(() => {
    socketRef.current = io("http://localhost:8080");
  }, []);

  return (
    <div className="w-full h-full flex justify-center items-start p-5">
      <p>Welcome to chit-chat</p>
    </div>
  );
};

export default Home;
