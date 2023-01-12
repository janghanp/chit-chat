import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { formatDistance, subDays } from "date-fns";

import { AuthErrorResponse, useAuth } from "../context/AuthContext";

interface MessageInfo {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: Date | string;
}
// TODO: Show the previous messages when a new user entered the room.
const Chat = () => {
  const params = useParams();

  const auth = useAuth();

  const navigate = useNavigate();

  const socketRef = useRef<Socket>();

  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const connectSocket = () => {
    // Connect to the socket server.
    socketRef.current = io("http://localhost:8080");

    // Join a specific room.
    socketRef.current?.emit("join_room", { roomName: params.roomName, username: auth.currentUser.username });

    // Listen for "receive_message" event
    socketRef.current?.on("receive_message", (data: MessageInfo) => {
      const { id, senderId, senderName, text, createdAt } = data;

      setMessages((prev) => [...prev, { id, senderId, senderName, text, createdAt }]);
    });
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
      } finally {
        setIsLoading(false);
      }
    };

    checkThePresenceOfChat();

    // When a user is moving between pages in the same tab, get rid of the previous socket instance and then establish a new connection.
    // This is different from leaving chat room. It is just changing socket instance but stay in the chat room.
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const sendMessage = () => {
    // Send a message to the socket server.
    socketRef.current!.emit("send_message", {
      senderId: auth.currentUser.id,
      roomName: params.roomName,
      senderName: auth.currentUser.username,
      text: message,
    });

    setMessage("");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>Chat room</p>

      {messages &&
        messages.map((msg) => {
          return (
            <div key={msg.id}>
              <p>{msg.senderName}</p>
              <p>{formatDistance(new Date(msg.createdAt), Date.now(), { addSuffix: true })}</p>
            </div>
          );
        })}

      <input className="border" type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
      <button className="border" onClick={sendMessage}>
        Send
      </button>
    </div>
  );
};

export default Chat;
