import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";

import { useAuth } from "../context/AuthContext";

const Chat = () => {
  const params = useParams();

  const auth = useAuth();

  const socketRef = useRef<Socket>();

  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    // Connect to the socket server.
    socketRef.current = io("http://localhost:8080");

    // Join a room.
    socketRef.current.emit("join_room", { roomName: params.roomName, username: auth.currentUser.username });
  }, []);

  const sendMessage = () => {
    // Send a message to the socket server.
    socketRef.current!.emit("send_message", {
      userId: auth.currentUser.id,
      roomId: params.roomId,
      username: auth.currentUser.username,
      text: message,
    });

    setMessage("");
  };

  return (
    <div>
      <p>Chat room</p>
      <input className="border" type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
      <button className="border" onClick={sendMessage}>
        Send
      </button>
    </div>
  );
};

export default Chat;
