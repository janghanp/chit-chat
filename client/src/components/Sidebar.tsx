import { useState, memo, useEffect } from 'react';
import { HiOutlineMenu } from 'react-icons/hi';
import { useQueryClient } from '@tanstack/react-query';

import ChatRoomList from './ChatRoomList';
import UserInfo from './UserInfo';
import Dropdown from './Dropdown';
import { useParams } from 'react-router-dom';
import useUser from '../hooks/useUser';
import useChatRooms from '../hooks/useChatRooms';
import { socket } from '../socket';

const Sidebar = () => {
	const { chatId } = useParams();

	const queryClient = useQueryClient();

	const currentChat = queryClient.getQueryData(['chat', chatId]);

	const { data: currentUser } = useUser();

	const { isLoading, isError, data: chatRooms } = useChatRooms();

	const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
	const [isDropDownOpen, setIsDropDownOpen] = useState<boolean>(false);

	useEffect(() => {
		if (socket.connected && currentUser && chatRooms) {
			socket.emit('user_connect', { userId: currentUser.id, chatIds: chatRooms.map((chat) => chat.id) });
		}
	}, [currentUser, chatRooms]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (isError) {
		return <div>Error...</div>;
	}

	return (
		<>
			<div className="fixed top-1 left-3 z-20 block sm:hidden">
				<button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
					<HiOutlineMenu className="text-3xl" />
				</button>
			</div>
			<div className={`fixed top-0 bottom-0 sm:z-auto ${isSidebarOpen ? 'z-30' : '-z-10'}`}>
				<div
					className={`${
						!isSidebarOpen && '-translate-x-96'
					} h-full border-r bg-base-100 pt-10 shadow-md duration-200 ease-linear sm:relative sm:translate-x-0`}
				>
					<div className="flex h-full w-80 flex-col justify-between">
						{currentChat && (
							<div className="fixed top-0 left-0 z-30 flex h-10 w-[321px] items-center justify-center border-r border-b">
								<span className="text-base font-semibold">{currentChat.chat.name}</span>
								<Dropdown
									isDropDownOpen={isDropDownOpen}
									setIsDropDownOpen={setIsDropDownOpen}
									isOwner={currentChat.chat.ownerId === currentUser!.id}
									chatId={chatId as string}
								/>
							</div>
						)}
						<div className="flex h-full flex-col justify-between">
							<ChatRoomList chatRooms={chatRooms} setIsSidebarOpen={setIsSidebarOpen} />
							<div>
								<UserInfo currentUser={currentUser!} />
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Overlay */}
			{isSidebarOpen && (
				<div
					className="fixed inset-0 z-20 block bg-black opacity-50 sm:hidden"
					onClick={() => setIsSidebarOpen(false)}
				></div>
			)}
		</>
	);
};

export default memo(Sidebar);
