import { useState, memo } from 'react';
import { useUser } from '../context/UserContext';
import { HiOutlineMenu } from 'react-icons/hi';

import ChatRoomList from './ChatRoomList';
import CreateChatButton from './CreateChatButton';
import UserInfo from './UserInfo';
import ExplorerButton from './ExplorerButton';

const Sidebar = () => {
	const { currentUser } = useUser();

	const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

	return (
		<>
			<div className="fixed top-1 left-3 z-20 block sm:hidden">
				<button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
					<HiOutlineMenu className="text-3xl" />
				</button>
			</div>

			<div className={`fixed top-0 bottom-0 ${isSidebarOpen ? 'z-30' : 'z-auto'}`}>
				<div
					className={`${
						!isSidebarOpen && '-translate-x-96'
					} h-full border-r bg-base-100 pt-14 shadow-md duration-200 ease-linear sm:relative sm:translate-x-0`}
				>
					{currentUser && currentUser.email && (
						<div className="flex h-full w-80 flex-col justify-between">
							<div className="flex h-full flex-col justify-between">
								<ChatRoomList chatRooms={currentUser.chats} setIsSidebarOpen={setIsSidebarOpen} />
								<div>
									<ExplorerButton />
									<CreateChatButton currentUserId={currentUser.id} />
									<UserInfo currentUser={currentUser} />
								</div>
							</div>
						</div>
					)}
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
