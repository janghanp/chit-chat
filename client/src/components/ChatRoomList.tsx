import { Link } from 'react-router-dom';

import { Chat } from '../types';

interface Props {
	chatRooms: Chat[] | undefined;
}

const ChatRoomList = ({ chatRooms }: Props) => {
	return (
		<div className="flex flex-col gap-y-3">
			{chatRooms &&
				chatRooms.map((chat) => {
					return (
						<div key={chat.id} className="tooltip tooltip-right h-12 w-12" data-tip={chat.name}>
							<Link to={`/chat/${chat.name}`} className="cursor-default">
								<button className="h-full w-full rounded-full border bg-base-300 font-semibold transition duration-300 hover:bg-base-content hover:text-base-200">
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
