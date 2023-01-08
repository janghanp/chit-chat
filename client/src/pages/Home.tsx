import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const auth = useAuth();

  const [welcomeMessage, setWelcomeMessage] = useState<string>("");
  const [socketId, setSocketId] = useState<string>("");

  useEffect(() => {
    const socket = io("http://localhost:8080");

    socket.on("connect", () => {
      console.log("connected to the server");
    });

    socket.on("welcome", (arg) => {
      console.log(arg);

      setWelcomeMessage(arg.message);
      setSocketId(arg.id);
    });

    return () => {
      socket.off("connect");
      socket.off("welcome");
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
