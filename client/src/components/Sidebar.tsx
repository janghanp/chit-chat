import { useState, memo } from 'react';
import { HiOutlineMenu } from 'react-icons/hi';
import { useParams } from 'react-router-dom';

import ChatRoomList from './ChatRoomList';
import UserInfo from './UserInfo';
import Dropdown from './Dropdown';
import useUser from '../hooks/useUser';
import useChat from '../hooks/useChat';

const Sidebar = () => {
	const { chatId } = useParams();
	const { data: currentUser } = useUser();
	const { data: currentChat } = useChat(chatId as string, currentUser!.id);
	const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
	const [isDropDownOpen, setIsDropDownOpen] = useState<boolean>(false);

	return (
		<>
			<div className="fixed left-3 top-1 z-20 block sm:hidden">
				<button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
					<HiOutlineMenu className="text-3xl" />
				</button>
			</div>
			<div className={`fixed bottom-0 top-0 sm:z-auto ${isSidebarOpen ? 'z-30' : '-z-10'}`}>
				<div
					className={`${
						!isSidebarOpen && '-translate-x-96'
					} bg-base-100 h-full border-r pt-10 shadow-md duration-200 ease-linear sm:relative sm:translate-x-0`}
				>
					<div className="flex h-full w-80 flex-col justify-between">
						{currentChat && (
							<div className="fixed left-0 top-0 z-30 flex h-10 w-[321px] items-center justify-center border-b border-r">
								<span className="text-base font-semibold">{currentChat.chat.name}</span>
								<Dropdown
									isDropDownOpen={isDropDownOpen}
									setIsDropDownOpen={setIsDropDownOpen}
									isOwner={currentChat.chat.ownerId === currentUser!.id}
									chatId={chatId as string}
								/>
							</div>
						)}
						<div className="flex h-full w-full flex-col justify-between">
							<ChatRoomList setIsSidebarOpen={setIsSidebarOpen} />
							<div>
								<UserInfo currentUser={currentUser!} setIsSidebarOpen={setIsSidebarOpen} />
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
