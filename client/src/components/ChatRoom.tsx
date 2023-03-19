import { Dispatch, memo, SetStateAction } from 'react';
import { Link } from 'react-router-dom';
import { Chat } from '../types';

interface Props {
	chatRoom: Chat;
	currentchatId: string;
	setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

const ChatRoom = ({ chatRoom, currentchatId, setIsSidebarOpen }: Props) => {
	return (
		<Link
			to={`/chat/${chatRoom.id}`}
			className={`${currentchatId === chatRoom.id ? 'active' : ''}`}
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
