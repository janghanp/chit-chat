import { Dispatch, SetStateAction } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Chat } from '../types';

interface Props {
	chatRooms: Chat[] | undefined;
	setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

const ChatRoomList = ({ chatRooms, setIsSidebarOpen }: Props) => {
	const params = useParams();

	return (
		<ul className="menu p-4">
			{chatRooms &&
				chatRooms.map((chat) => {
					return (
						<li key={chat.id}>
							<Link
								to={`/chat/${chat.name}`}
								className={`${params.roomName === chat.name ? 'active' : ''}`}
								onClick={() => setIsSidebarOpen(false)}
							>
								{chat.name}
							</Link>
						</li>
					);
				})}
		</ul>
	);
};

export default ChatRoomList;
