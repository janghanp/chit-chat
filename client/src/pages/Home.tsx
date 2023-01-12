import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { AuthErrorResponse } from "../types";

const Home = () => {
  const [roomToCreate, setRoomToCreate] = useState<string>("");
  const [roomToJoin, setRoomToJoin] = useState<string>("");

  const navigate = useNavigate();

  const joinRoom = async () => {
    if (!roomToJoin) {
      return;
    }

    navigate(`/chat/${roomToJoin}`);
    setRoomToJoin("");
  };

  const createRoom = async () => {
    if (!roomToCreate) {
      return;
    }

    // Check if a chat room to create already exists.
    try {
      await axios.post("http://localhost:8080/chat", { roomName: roomToCreate }, { withCredentials: true });

      // A chat room has been created and redirect a user to the Chat page.
      navigate(`/chat/${roomToCreate}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        //Chat room already exists.
        const serverError = error.response.data as AuthErrorResponse;
        alert(serverError.message);
        return;
      } else if (error instanceof Error) {
        console.log(error);
      }

      return;
    } finally {
      setRoomToCreate("");
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-y-10 justify-start items-center p-5">
      <p>Welcome to chit-chat</p>

      <div>
        <label> Join a room</label>
        <input className="border" type="text" value={roomToJoin} onChange={(e) => setRoomToJoin(e.target.value)} />
        <button onClick={joinRoom}>Join a room</button>
      </div>

      <div>
        <label>Create a room</label>
        <input className="border" type="text" value={roomToCreate} onChange={(e) => setRoomToCreate(e.target.value)} />
        <button onClick={createRoom}>Create a room</button>
      </div>
    </div>
  );
};

export default Home;
