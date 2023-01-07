import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:8080");

function App() {
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [lastPong, setLastPong] = useState<string>("");
  const [welcomeMessage, setWelcomeMessage] = useState<string>("");

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("pong", () => {
      setLastPong(new Date().toISOString());
    });

    socket.on("welcome", (arg) => {
      setWelcomeMessage(arg.message);
    });

    return () => {
      socket.off("connect");
      socket.off("pong");
    };
  }, []);

  const sendPing = () => {
    socket.emit("ping");
  };

  return (
    <div className="conatiner mx-auto min-h-screen">
      <div className="flex flex-col justify-center items-center gap-y-3">
        <p>Connected: {"" + isConnected}</p>
        <p>Last pong: {lastPong || "-"}</p>
        <button className="border p-1 rounded-md " onClick={sendPing}>
          Send Ping
        </button>
      </div>

      <div className="flex flex-col border border-teal-500 mt-5 justify-start items-center min-h-screen p-5">
        {welcomeMessage && (
          <span className="border p-1 rounded-md bg-gray-200">
            Welcome, u have joined a chat room.
          </span>
        )}
      </div>
    </div>
  );
}

export default App;
