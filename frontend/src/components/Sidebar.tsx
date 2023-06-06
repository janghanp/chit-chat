import { useState } from 'react';
import { HiBars3 } from 'react-icons/hi2';

import ChatRoomList from './ChatRoomList';
import useUser from '../hooks/useUser';
import CreateChatButton from './CreateChatButton';
import SideBottom from './SideBottom';

const Sidebar = () => {
	const { data: currentUser } = useUser();
	const [isSideBarOpen, setIsSidebarOpen] = useState<boolean>(false);

	return (
		<>
			<div
				className={`fixed ${isSideBarOpen ? 'block md:hidden' : 'hidden'} inset-0 z-20 bg-gray-600/50`}
				onClick={() => setIsSidebarOpen(!isSideBarOpen)}
			></div>
			<div
				className={`bg-base-100 ${
					isSideBarOpen ? 'fixed flex md:relative md:flex' : 'hidden'
				} z-20 h-full w-80 flex-col gap-y-5 rounded-md border p-3 shadow-md md:flex md:relative`}
			>
				<div className="boder flex items-center justify-between p-3">
					<h1 className="text-3xl font-bold">Chats</h1>
					<CreateChatButton currentUserId={currentUser!.id} />
				</div>
				<div className="no-scrollbar h-full overflow-y-auto">
					<ChatRoomList setIsSidebarOpen={setIsSidebarOpen} />
				</div>
				<SideBottom />
			</div>

			{/* Hamber menu for mobile */}
			<div className={`absolute left-0 right-0 top-3 z-10 block md:hidden border-b pl-3 shadow-md`}>
				<button
					className="btn-ghost btn-sm btn btn-square"
					onClick={() => setIsSidebarOpen(!isSideBarOpen)}
				>
					<HiBars3 className="text-2xl" />
				</button>
			</div>
		</>
	);
};

export default Sidebar;
