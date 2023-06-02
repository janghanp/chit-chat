import { memo, Dispatch, SetStateAction } from 'react';

import ChatRoomList from './ChatRoomList';
import useUser from '../hooks/useUser';
import CreateChatButton from './CreateChatButton';

interface Props {
	setIsSideOpen?: Dispatch<SetStateAction<boolean>>;
}

const Sidebar = ({ setIsSideOpen }: Props) => {
	const { data: currentUser } = useUser();

	const closeSidebar = () => {
		if (setIsSideOpen) {
			setIsSideOpen(false);
		}
	};

	return (
		<div className="bg-base-100 flex h-full w-80 flex-col gap-y-5 rounded-md border p-3 shadow-md">
			<div className="boder flex items-center justify-between p-3">
				<h1 className="text-3xl font-bold">Chats</h1>
				<CreateChatButton closeSidebar={closeSidebar} currentUserId={currentUser!.id} />
			</div>
			<div className="no-scrollbar h-full overflow-y-auto">
				<ChatRoomList setIsSidebarOpen={setIsSideOpen} />
			</div>
		</div>
	);
};

export default memo(Sidebar);
