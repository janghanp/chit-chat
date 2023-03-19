import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';

interface Props {
	socket: Socket;
}

const Explorer = ({ socket }: Props) => {
	const [roomName, setRoomName] = useState<string>('');

	const navigate = useNavigate();

	const joinRoom = async () => {
		if (!roomName) {
			return;
		}

		try {
			const { data } = await axios.get('http://localhost:8080/chat/name', {
				params: { chatName: roomName },
				withCredentials: true,
			});

			navigate(`/chat/${data.id}`);
			setRoomName('');
		} catch (error) {
			// No chatroom found handle the error.
			console.log(error);
		}
	};

	return (
		<div className="flex h-full w-full flex-col items-center justify-start gap-y-10 p-5">
			<p>Welcome to chit-chat</p>

			<div>
				<label> Join a room</label>
				<input className="border" type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
				<button onClick={joinRoom}>Join a room</button>
			</div>
		</div>
	);
};

export default Explorer;
