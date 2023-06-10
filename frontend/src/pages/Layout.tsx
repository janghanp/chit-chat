import { Outlet } from 'react-router-dom';

import { ToggleSidebarProvider } from '../context/toggleSidebarContext';
import Sidebar from '../components/Sidebar';

const Layout = () => {
    return (
        <div className="flex h-[calc(100dvh)] gap-x-0 p-0 md:gap-x-5 md:p-5">
            <div>
                <ToggleSidebarProvider>
                    <Sidebar />
                </ToggleSidebarProvider>
            </div>
            <div className="w-full flex-1 rounded-md border shadow-md fixed md:relative inset-0">
                <Outlet />
            </div>
            <div className="fixed right-0 -ml-5 h-full md:relative" id="chat-member-list"></div>
        </div>
    );
};

export default Layout;
