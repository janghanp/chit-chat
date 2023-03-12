import { Outlet } from 'react-router-dom';

import Sidebar from '../components/Sidebar';

const Layout = () => {
	return (
		<div className="fle-row flex h-screen">
			<Sidebar />

			{/* <!-- Page content here --> */}
			<div className="flex flex-col items-center justify-start p-10 flex-1 z-10">
				<Outlet />
			</div>
		</div>
	);
};

export default Layout;
