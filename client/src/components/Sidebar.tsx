import { useState, memo } from 'react';
import { HiOutlineMenu } from 'react-icons/hi';
import { useParams } from 'react-router-dom';

import ChatRoomList from './ChatRoomList';
import UserInfo from './UserInfo';
import Dropdown from './Dropdown';
import useUser from '../hooks/useUser';
import useChat from '../hooks/useChat';
import CreateChatButton from './CreateChatButton';
import { HiCamera, HiPlus } from 'react-icons/hi';

const Sidebar = () => {
	const { chatId } = useParams();
	const { data: currentUser } = useUser();
	const { data: currentChat } = useChat(chatId as string, currentUser!.id);
	const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
	const [isDropDownOpen, setIsDropDownOpen] = useState<boolean>(false);

	const closeSidebar = () => {
		// setIsSidebarOpen(false);
	};

	return (
		<div className="flex w-80 flex-col gap-y-5 rounded-md border p-3 shadow-md">
			<div className="boder flex items-center justify-between p-3">
				<h1 className="text-3xl font-bold">Chats</h1>
				<CreateChatButton closeSidebar={closeSidebar} currentUserId={currentUser!.id} />
			</div>
			<div className="p-3">
				<input type="text" placeholder="Search..." className="input input-sm input-bordered w-full" />
			</div>
			<div className="h-full overflow-y-auto">
				<ChatRoomList setIsSidebarOpen={setIsSidebarOpen} />
			</div>
		</div>
	);

	return (
		<>
			{/* hamberger button */}
			{/* <div className="fixed left-3 top-1 z-20 block sm:hidden">
				<button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
					<HiOutlineMenu className="text-3xl" />
				</button>
			</div> */}
			{/* <div className={`fixed bottom-0 top-0 sm:z-auto ${isSidebarOpen ? 'z-30' : '-z-10'}`}>
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
			</div> */}
			{/* Overlay */}
			{/* {isSidebarOpen && (
				<div
					className="fixed inset-0 z-20 block bg-black opacity-50 sm:hidden"
					onClick={() => setIsSidebarOpen(false)}
				></div>
			)} */}
		</>
	);
};

export default memo(Sidebar);
