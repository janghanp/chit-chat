import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";

import { useAuth } from "../context/AuthContext";

//TODO: Previous messages should be loaded.
//TODO: Notify people who were already in the room that a new person has joined.
//TODO: User should be able to send a mesasge.
//TODO: Global socker instance. -> It dose not have to be global since it is used inside of Chat component. Children components of Chat can get it as a prop. if it is getting deep, use context then.

//* Send a message to the server.
//* Store the mesage in the chat table.
//* Send back that message to the chat room.

const Chat = () => {
  const params = useParams();

  const auth = useAuth();

  const socketRef = useRef<Socket>();

  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    // Connect to the socket server.
    socketRef.current = io("http://localhost:8080");

    // Join a specific room.
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

  console.log("render");

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
