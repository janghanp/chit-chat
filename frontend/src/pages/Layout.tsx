import { Outlet, useLocation } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useState } from 'react';

const Layout = () => {
	const location = useLocation();
	const [isSideOpen, setIsSideOpen] = useState<boolean>(false);

	return (
		<div className="flex h-screen gap-x-5 p-0 md:p-5">
			{/* Desktop screen */}
			<div className="hidden md:block">
				<Navbar />
			</div>

			<div className="hidden md:block">
				<Sidebar />
			</div>

			{/* Mobile screen */}
			{isSideOpen && (
				<>
					<div className="fixed inset-0 z-30 bg-gray-700/50 md:hidden" onClick={() => setIsSideOpen(false)}></div>
					<div className="fixed z-40 h-full md:hidden">
						<Sidebar setIsSideOpen={setIsSideOpen} />
					</div>
				</>
			)}

			<div className="w-full flex-1 rounded-md border shadow-md">
				<Outlet context={{ setIsSideOpen }} />
			</div>

			<div className="fixed right-0 -ml-5 h-full md:relative" id="chat-member-list"></div>

			{/* Mobile screen navbar */}
			{(!location.pathname.includes('chat') || isSideOpen) && (
				<div className="fixed bottom-0 left-0 right-0 z-50 block md:hidden">
					<Navbar setIsSideOpen={setIsSideOpen} />
				</div>
			)}
		</div>
	);
};

export default Layout;
