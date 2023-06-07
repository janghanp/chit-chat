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
                className={`bg-base-100 relative z-20 hidden h-full w-80 flex-col gap-y-5 rounded-md border p-3 shadow-md md:block md:opacity-100`}
            >
                <div className="boder flex items-center justify-between p-3">
                    <h1 className="text-3xl font-bold">Chats</h1>
                    <CreateChatButton currentUserId={currentUser!.id} />
                </div>
                <div className="no-scrollbar max-h-screen overflow-y-auto">
                    <ChatRoomList setIsSidebarOpen={setIsSidebarOpen} />
                </div>
                <SideBottom />
            </div>
            {/* Hamber menu for mobile */}
            <div
                className={`absolute left-0 right-0 top-[10px] z-10 block border-b pl-3 shadow-md md:hidden`}
            >
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
