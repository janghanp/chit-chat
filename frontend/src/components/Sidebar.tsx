import { HiBars3 } from 'react-icons/hi2';

import ChatRoomList from './ChatRoomList';
import useUser from '../hooks/useUser';
import CreateChatButton from './CreateChatButton';
import SideBottom from './SideBottom';
import { useToggleSidebarContext } from '../context/toggleSidebarContext';

const Sidebar = () => {
    const { data: currentUser } = useUser();
    const { toggleSidebar } = useToggleSidebarContext();

    return (
        <>
            <div
                id="side-bar"
                className="bg-base-100 fixed md:sticky -z-10 md:z-40 h-full w-0 opacity-0 md:opacity-100 md:w-80 flex-col gap-y-5 rounded-md border p-3 shadow-md"
            >
                <div className="boder flex items-center justify-between p-3">
                    <h1 className="text-3xl font-bold">Chats</h1>
                    <CreateChatButton currentUserId={currentUser!.id} />
                </div>
                <div className="no-scrollbar max-h-screen overflow-y-auto">
                    <ChatRoomList />
                </div>
                <SideBottom />
            </div>
            {/* Hamber menu for mobile */}
            <button
                className="btn-ghost btn-sm btn btn-square fixed z-[5] left-3 top-3"
                onClick={toggleSidebar}
            >
                <HiBars3 className="text-2xl" />
            </button>
        </>
    );
};

export default Sidebar;
