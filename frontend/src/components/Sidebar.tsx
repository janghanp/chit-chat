import { useState } from 'react';
import { HiBars3 } from 'react-icons/hi2';

import ChatRoomList from './ChatRoomList';
import useUser from '../hooks/useUser';
import CreateChatButton from './CreateChatButton';

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
				} z-20 h-full w-80 flex-col gap-y-5 rounded-md border p-3 shadow-md md:flex`}
			>
				<div className="boder flex items-center justify-between p-3">
					<h1 className="text-3xl font-bold">Chats</h1>
					<CreateChatButton currentUserId={currentUser!.id} />
				</div>
				<div className="no-scrollbar h-full overflow-y-auto">
					<ChatRoomList setIsSidebarOpen={setIsSidebarOpen} />
				</div>
			</div>
			<div className={`absolute left-5 top-7 z-10 block md:hidden`}>
				<button
					className="btn-ghost btn-sm btn btn-square btn-outline shadow-lg"
					onClick={() => setIsSidebarOpen(!isSideBarOpen)}
				>
					<HiBars3 className="text-2xl" />
				</button>
			</div>
		</>
	);
};

export default Sidebar;
