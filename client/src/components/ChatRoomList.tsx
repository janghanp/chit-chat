import { Dispatch, SetStateAction } from 'react';
import { useParams } from 'react-router-dom';

import { Chat } from '../types';
import ChatRoom from './ChatRoom';

interface Props {
	chatRooms: Chat[] | undefined;
	setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

const ChatRoomList = ({ chatRooms, setIsSidebarOpen }: Props) => {
	const params = useParams();

	return (
		<ul className="menu p-4">
			{chatRooms &&
				chatRooms.map((chatRoom) => {
					return (
						<li key={chatRoom.id}>
							<ChatRoom
								chatRoom={chatRoom}
								currentRoomName={params.roomName as string}
								setIsSidebarOpen={setIsSidebarOpen}
							/>
						</li>
					);
				})}
		</ul>
	);
};

export default ChatRoomList;
