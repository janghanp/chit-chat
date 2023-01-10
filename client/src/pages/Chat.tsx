import { useState } from "react";
import { useParams } from "react-router-dom";

//TODO: previous messages should be loaded.
//TODO: Notify othres that were already in the room that a new person has joined.
//TODO: User should be able to send a mesasge.

//! When a user is tyring to join a room without going through Home page, there is no socket conneection.

const Chat = () => {
  const params = useParams();

  const [message, setMessage] = useState<string>("");

  const sendMessage = () => {
    //? How to share socketRef globally?
  };

  return (
    <div>
      <p>Chat room</p>
      <input className="border" type="text" onChange={(e) => setMessage(e.target.value)} />
      <button className="border" onClick={sendMessage}>
        Send
      </button>
    </div>
  );
};

export default Chat;
