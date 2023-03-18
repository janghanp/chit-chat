import { Dispatch, memo, SetStateAction } from 'react';
import { Link } from 'react-router-dom';
import { Chat } from '../types';

interface Props {
	chatRoom: Chat;
	currentRoomName: string;
	setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

const ChatRoom = ({ chatRoom, currentRoomName, setIsSidebarOpen }: Props) => {
	return (
		<Link
			to={`/chat/${chatRoom.name}`}
			className={`${currentRoomName === chatRoom.name ? 'active' : ''}`}
			onClick={() => setIsSidebarOpen(false)}
		>
			{chatRoom.icon ? (
				<div className="avatar">
					<div className="w-8 rounded-full">
						<img src={chatRoom.icon} alt={chatRoom.name} />
					</div>
				</div>
			) : (
				<div className="avatar text-center">
					<div className="w-8 rounded-full border border-base-content font-semibold">{chatRoom.name.charAt(0)}</div>
				</div>
			)}
			<div>{chatRoom.name}</div>
		</Link>
	);
};

export default memo(ChatRoom);
