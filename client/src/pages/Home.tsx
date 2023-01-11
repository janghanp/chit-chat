import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const [roomName, setRoomName] = useState<string>();

  const navigate = useNavigate();

  const joinRoom = () => {
    if (!roomName) {
      return;
    }

    navigate(`/chat/${roomName}`);
  };

  const createRoom = async () => {
    if (!roomName) {
      return;
    }

    try {
      // Send a http request to create a room.
      // Changes are a user is going to get an error message saying that the room you are about to create already exists.
      //? 1. Would you like to join the room? 2. Abort it.
      await axios.post("http://localhost:8080/chat", { roomName }, { withCredentials: true });
    } catch (error) {
      console.log(error);

      return;
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-y-10 justify-start items-center p-5">
      <p>Welcome to chit-chat</p>

      <div>
        <label> Join a room</label>
        <input className="border" type="text" onChange={(e) => setRoomName(e.target.value)} />
        <button onClick={joinRoom}>Join a room</button>
      </div>

      <div>
        <label>Create a room</label>
        <input className="border" type="text" onChange={(e) => setRoomName(e.target.value)} />
        <button onClick={createRoom}>Create a room</button>
      </div>
    </div>
  );
};

export default Home;
