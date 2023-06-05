import { Dispatch, SetStateAction, memo, useState } from 'react';

import GroupChatRoom from './GroupChatRoom';
import PrivateChatRoom from './PrivateChatRoom';
import ChatRoomSkeleton from './ChatRoomSkeleton';
import useGroupChatRooms from '../hooks/useGroupChatRooms';
import usePrivateChatRooms from '../hooks/usePrivateChatRooms';

interface Props {
	setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

const ChatRoomList = ({ setIsSidebarOpen }: Props) => {
	const { isLoading: isGroupChatsLoading, isError: isGroupChatsError, data: groupChatRooms } = useGroupChatRooms();
	const {
		isLoading: isPrivateChatLoading,
		isError: isPrivateChatsError,
		data: privatChatRooms,
	} = usePrivateChatRooms();
	// const [search, setSearch] = useState<string>('');
	// const [filteredChatRooms, setFilteredChatRooms] = useState<Chat[]>();
	const [isGroupChat, setIsGroupChat] = useState<boolean>(true);

	const toggleTypeHandler = () => {
		setIsGroupChat((prevState) => !prevState);
	};

	if (isGroupChatsLoading || isPrivateChatLoading) {
		const arr = Array(5).fill(0);

		return (
			<div>
				{arr.map((_, index) => {
					return <ChatRoomSkeleton key={index} index={index} />;
				})}
			</div>
		);
	}

	if (isGroupChatsError || isPrivateChatsError) {
		return <div>Error...</div>;
	}

	return (
		<>
			{/* <div className="px-1 py-5">
				<input
					type="text"
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search..."
					className="input input-sm input-bordered w-full"
				/>
			</div> */}

			<div className="tabs tabs-boxed bg-base-100 mb-5 border shadow-sm">
				<span
					onClick={toggleTypeHandler}
					className={`tab tab-sm flex-1 ${isGroupChat && ' bg-base-content rounded-md text-white'}`}
				>
					Group
				</span>
				<span
					onClick={toggleTypeHandler}
					className={`tab tab-sm flex-1 ${!isGroupChat && 'bg-base-content rounded-md text-white'}`}
				>
					Direct message
				</span>
			</div>

			<table className="table w-full" data-cy="chat-room-list">
				<tbody className="w-full">
					{isGroupChat ? (
						<>
							{groupChatRooms &&
								groupChatRooms.map((groupChatRoom) => {
									return (
										<GroupChatRoom
											key={groupChatRoom.id}
											groupChatRoom={groupChatRoom}
											setIsSidebarOpen={setIsSidebarOpen}
										/>
									);
								})}
						</>
					) : (
						<>
							{privatChatRooms &&
								privatChatRooms.map((privateChatRoom) => {
									return (
										<PrivateChatRoom
											key={privateChatRoom.id}
											privateChatRoom={privateChatRoom}
											setIsSidebarOpen={setIsSidebarOpen}
										/>
									);
								})}
						</>
					)}
				</tbody>
			</table>
		</>
	);
};

export default memo(ChatRoomList);
