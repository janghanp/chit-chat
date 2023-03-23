import { Dispatch, SetStateAction } from 'react';

import { Chat } from '../types';
import ChatRoom from './ChatRoom';

interface Props {
	chatRooms: Chat[] | undefined;
	setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

const ChatRoomList = ({ chatRooms, setIsSidebarOpen }: Props) => {
	return (
		<table className="table w-full">
			<tbody>
				{chatRooms &&
					chatRooms.map((chatRoom) => {
						return <ChatRoom key={chatRoom.id} chatRoom={chatRoom} setIsSidebarOpen={setIsSidebarOpen} />;
					})}
			</tbody>
		</table>
	);
};

export default ChatRoomList;
