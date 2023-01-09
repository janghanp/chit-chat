import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:8080");

const Home = () => {
  const joinRoom = () => {
    socket.emit("join_room", 123);
  };

  return (
    <div className="w-full h-full flex justify-center items-start p-5">
      <button onClick={joinRoom}>join room 123</button>
    </div>
  );
};

export default Home;
