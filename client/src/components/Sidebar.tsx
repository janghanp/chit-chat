import { useState, memo } from 'react';

import ChatRoomList from './ChatRoomList';
import useUser from '../hooks/useUser';
import CreateChatButton from './CreateChatButton';

const Sidebar = () => {
	const { data: currentUser } = useUser();
	const [_isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

	const closeSidebar = () => {
		// setIsSidebarOpen(false);
	};

	return (
		<div className="bg-base-100 flex w-80 flex-col gap-y-5 rounded-md border p-3 shadow-md">
			<div className="boder flex items-center justify-between p-3">
				<h1 className="text-3xl font-bold">Chats</h1>
				<CreateChatButton closeSidebar={closeSidebar} currentUserId={currentUser!.id} />
			</div>
			<div className="p-3">
				<input type="text" placeholder="Search..." className="input input-sm input-bordered w-full" />
			</div>
			<div className="no-scrollbar h-full overflow-y-auto">
				<ChatRoomList setIsSidebarOpen={setIsSidebarOpen} />
			</div>
		</div>
	);
};

export default memo(Sidebar);
