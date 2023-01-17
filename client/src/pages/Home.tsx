import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
	const [roomName, setRoomName] = useState<string>('');

	const navigate = useNavigate();

	const joinRoom = async () => {
		if (!roomName) {
			return;
		}

		navigate(`/chat/${roomName}`);
		setRoomName('');
	};

	return (
		<div className="w-full h-full flex flex-col gap-y-10 justify-start items-center p-5">
			<p>Welcome to chit-chat</p>

			<div>
				<label> Join a room</label>
				<input className="border" type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
				<button onClick={joinRoom}>Join a room</button>
			</div>
		</div>
	);
};

export default Home;
