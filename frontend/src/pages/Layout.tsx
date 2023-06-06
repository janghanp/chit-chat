import { Outlet } from 'react-router-dom';

import Sidebar from '../components/Sidebar';

const Layout = () => {
	return (
		<div className="flex h-screen gap-x-0 p-0 md:gap-x-5 md:p-5">
			<div>
				<Sidebar />
			</div>
			<div className="w-full flex-1 rounded-md border shadow-md">
				<Outlet />
			</div>
			<div className="fixed right-0 -ml-5 h-full md:relative" id="chat-member-list"></div>
		</div>
	);
};

export default Layout;
