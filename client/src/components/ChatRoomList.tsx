import { Dispatch, SetStateAction } from 'react';
import { Link } from 'react-router-dom';

import { Chat } from '../types';

interface Props {
	chatRooms: Chat[] | undefined;
	setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

const ChatRoomList = ({ chatRooms, setIsSidebarOpen }: Props) => {
	return (
		<div className="flex flex-col gap-y-3">
			{chatRooms &&
				chatRooms.map((chat) => {
					return (
						<div key={chat.id} className="tooltip tooltip-right h-12 w-12" data-tip={chat.name}>
							<Link to={`/chat/${chat.name}`} className="cursor-default" onClick={() => setIsSidebarOpen(false)}>
								<button className="h-full w-full rounded-full bg-primary-content font-semibold transition duration-300 hover:bg-primary">
									{chat.name.charAt(0)}
								</button>
							</Link>
						</div>
					);
				})}
		</div>
	);
};

export default ChatRoomList;
