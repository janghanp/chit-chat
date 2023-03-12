import { Outlet } from 'react-router-dom';

import Sidebar from '../components/Sidebar';

const Layout = () => {
	return (
		<div className="fle-row flex h-screen">
			<Sidebar />

			{/* <!-- Page content here --> */}
			<div className="z-10 flex flex-1 flex-col items-center justify-start p-10">
				<Outlet />
			</div>
		</div>
	);
};

export default Layout;
