import { useState, memo } from 'react';
import { HiOutlineMenu, HiX } from 'react-icons/hi';
import { useQuery } from '@tanstack/react-query';

import ChatRoomList from './ChatRoomList';
import CreateChatButton from './CreateChatButton';
import UserInfo from './UserInfo';
import ExplorerButton from './ExplorerButton';
import { useCurrentUserStore } from '../store';
import { fetchChatRooms } from '../api/chat';

const Sidebar = () => {
	const currentUser = useCurrentUserStore((state) => state.currentUser);

	const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

	const { isLoading, isError, data } = useQuery({
		queryKey: ['chatRooms', currentUser!.id],
		queryFn: async () => fetchChatRooms(currentUser!.id),
		// 1 min
		staleTime: 1000 * 60,
	});

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
			<div className={`fixed top-0 bottom-0 sm:z-auto ${isSidebarOpen ? 'z-30' : 'z-auto'}`}>
				<div
					className={`${
						!isSidebarOpen && '-translate-x-96'
					} h-full border-r bg-base-100 pt-10 shadow-md duration-200 ease-linear sm:relative sm:translate-x-0`}
				>
					<div className="flex h-full w-80 flex-col justify-between">
						<button
							className="btn-outline btn-sm btn-circle btn absolute top-1 right-3 block sm:hidden"
							onClick={() => setIsSidebarOpen(!isSidebarOpen)}
						>
							<HiX />
						</button>
						<div className="flex h-full flex-col justify-between">
							<ChatRoomList chatRooms={data.chats} setIsSidebarOpen={setIsSidebarOpen} />
							<div>
								<ExplorerButton />
								<CreateChatButton currentUserId={currentUser!.id} />
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
