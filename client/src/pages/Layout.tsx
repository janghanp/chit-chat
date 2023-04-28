import { Outlet } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const Layout = () => {
	return (
		<div className="flex h-screen gap-x-5 p-5">
			<Navbar />
			<Sidebar />
			<div className="w-full flex-1 rounded-md border shadow-md">
				<Outlet />
			</div>
		</div>
	);
};

export default Layout;
