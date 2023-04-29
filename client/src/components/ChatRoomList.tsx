import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import useChatRooms from '../hooks/useChatRooms';
import useUser from '../hooks/useUser';
import { socket } from '../socket';

import ChatRoom from './ChatRoom';
import ChatRoomSkeleton from './ChatRoomSkeleton';

interface Props {
	setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

const ChatRoomList = ({ setIsSidebarOpen }: Props) => {
	const { isLoading, isError, data: chatRooms } = useChatRooms();

	const { data: currentUser } = useUser();

	const setRef = useRef<boolean>(false);

	useEffect(() => {
		if (socket.connected && chatRooms && !setRef.current && currentUser) {
			socket.emit('user_connect', { userId: currentUser.id, chatIds: chatRooms.map((chat) => chat.id) });
			setRef.current = true;
		}
	}, [chatRooms, currentUser]);

	if (isLoading) {
		const arr = Array(5).fill(0);

		return (
			<div>
				{arr.map((_, index) => {
					return <ChatRoomSkeleton key={index} index={index} />;
				})}
			</div>
		);
	}

	if (isError) {
		return <div>Error...</div>;
	}

	return (
		<table className="table w-full" data-cy="chat-room-list">
			<tbody className="w-full">
				{chatRooms &&
					chatRooms.map((chatRoom) => {
						return <ChatRoom key={chatRoom.id} chatRoom={chatRoom} setIsSidebarOpen={setIsSidebarOpen} />;
					})}
			</tbody>
		</table>
	);
};

export default ChatRoomList;
