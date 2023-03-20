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
		<table className="table w-full">
			<tbody>
				{chatRooms &&
					chatRooms.map((chatRoom) => {
						return (
							<tr key={chatRoom.id} className={`hover ${params.chatId === chatRoom.id ? 'active' : ''} w-full`}>
								<th className="w-full rounded-none p-2">
									<ChatRoom chatRoom={chatRoom} setIsSidebarOpen={setIsSidebarOpen} />
								</th>
							</tr>
						);
					})}
			</tbody>
		</table>
	);
};

export default ChatRoomList;
