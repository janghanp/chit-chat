import { format } from 'date-fns';
import { Dispatch, memo, SetStateAction } from 'react';
import { Link } from 'react-router-dom';
import { Chat } from '../types';

interface Props {
	chatRoom: Chat;
	setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

const ChatRoom = ({ chatRoom, setIsSidebarOpen }: Props) => {
	const gap = new Date().getTime() - new Date(chatRoom.messages![0].createdAt).getTime();

	// 86400000 = 24 hours
	const isToday = gap < 86400000;

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
				<div className="flex w-full flex-col">
					<span className="flex w-full items-center justify-between font-semibold">
						<span>{chatRoom.name}</span>
						<span>
							<time className="ml-2 text-xs opacity-50">
								{isToday ? (
									<>{format(new Date(chatRoom.messages![0].createdAt), 'p')}</>
								) : (
									<>{format(new Date(chatRoom.messages![0].createdAt), 'MM/dd')}</>
								)}
							</time>
						</span>
					</span>

					<span className="text-sm font-normal">
						{chatRoom.messages![0].sender.username}: {chatRoom.messages![0].text}
					</span>
				</div>
			</div>
		</Link>
	);
};

export default memo(ChatRoom);
