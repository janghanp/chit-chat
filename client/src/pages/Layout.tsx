import { Outlet } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import { useUser } from '../context/UserContext';

const Layout = () => {
	// const {currentUser} = useUser();
	// console.log(currentUser);

	console.log('Layout.tsx render');

	return (
		<div className="fle-row flex h-screen">
			<Sidebar />

			<div className="z-10 flex flex-1 flex-col items-center justify-start p-10">
				<Outlet />
			</div>
		</div>
	);
};

export default Layout;
