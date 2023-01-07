import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:8080");

const Home = () => {
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [welcomeMessage, setWelcomeMessage] = useState<string>("");
  const [socketId, setSocketId] = useState<string>("");

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("welcome", (arg) => {
      setWelcomeMessage(arg.message);
      setSocketId(arg.id);
    });

    return () => {
      socket.off("connect");
    };
  }, []);

  return (
    <div className="w-full h-full flex justify-center items-start p-5">
      {welcomeMessage && socketId && (
        <span className="border p-1 rounded-md bg-gray-200">
          {welcomeMessage + " " + socketId}
        </span>
      )}
    </div>
  );
};

export default Home;
