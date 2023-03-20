import { Dispatch, memo, SetStateAction } from 'react';
import { Link } from 'react-router-dom';
import { Chat } from '../types';

interface Props {
	chatRoom: Chat;
	setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

const ChatRoom = ({ chatRoom, setIsSidebarOpen }: Props) => {
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
				<div>{chatRoom.name}</div>
			</div>
		</Link>
	);
};

export default memo(ChatRoom);
