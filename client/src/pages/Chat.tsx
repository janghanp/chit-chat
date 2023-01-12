import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";

import { AuthErrorResponse, useAuth } from "../context/AuthContext";

const Chat = () => {
  const params = useParams();

  const auth = useAuth();

  const navigate = useNavigate();

  const socketRef = useRef<Socket>();

  const [message, setMessage] = useState<string>("");

  const connectSocket = () => {
    // Connect to the socket server.
    socketRef.current = io("http://localhost:8080");

    // Join a specific room.
    socketRef.current?.emit("join_room", { roomName: params.roomName, username: auth.currentUser.username });
  };

  useEffect(() => {
    // Check the presence of a chat room.
    const checkThePresenceOfChat = async () => {
      try {
        await axios.get("http://localhost:8080/chat", { params: { roomName: params.roomName }, withCredentials: true });

        connectSocket();
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 400) {
          //No chat room found to join
          const serverError = error.response.data as AuthErrorResponse;

          alert(serverError.message);
          navigate(-1);
          return;
        } else if (error instanceof Error) {
          console.log(error);
        }
      }
    };

    checkThePresenceOfChat();

    // When a user is moving between pages, get rid of the previous socket instance and then establish new connection.
    // This is different from leaving chat room. It is just changing socket instance but stay in the chat room.
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const sendMessage = () => {
    // Send a message to the socket server.
    socketRef.current!.emit("send_message", {
      userId: auth.currentUser.id,
      roomName: params.roomName,
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
