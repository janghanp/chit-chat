import axios from 'axios';
import { Dispatch, memo, SetStateAction, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Chat } from '../types';

interface Props {
	chatRoom: Chat;
	setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

const ChatRoom = ({ chatRoom, setIsSidebarOpen }: Props) => {
	const [lastMessage, setLastMessage] = useState<any>();
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchTheLastMessage = async () => {
			const { data } = await axios.get(`http://localhost:8080/chat/message/${chatRoom.id}`, { withCredentials: true });
			setLastMessage(data.message);
			setIsLoading(false);
		};

		if (!lastMessage) {
			fetchTheLastMessage();
		}
	}, []);

	if (isLoading) {
		return <div></div>;
	}

	return (
		<Link to={`/chat/${chatRoom.id}`} onClick={() => setIsSidebarOpen(false)}>
			<div className="flex items-center justify-start gap-x-3">
				{chatRoom.icon ? (
					<div className="avatar">
						<div className="w-10 rounded-full">
							<img src={chatRoom.icon} alt={chatRoom.name} />
						</div>
					</div>
				) : (
					<div className="placeholder avatar">
						<div className="w-10 rounded-full bg-neutral-focus text-neutral-content">
							<span>{chatRoom.name.charAt(0).toUpperCase()}</span>
						</div>
					</div>
				)}
				<div className="flex flex-col">
					<span className="font-semibold">{chatRoom.name}</span>
					<span className="font-normal text-sm">
						{lastMessage.sender.username} : {lastMessage.text}{' '}
					</span>
				</div>
			</div>
		</Link>
	);
};

export default memo(ChatRoom);
