import { HiCog } from 'react-icons/hi';

import ExplorerButton from './ExplorerButton';
import FriendsButton from './FriendsButton';
import LogoutButton from './LogoutButton';
import Inbox from './Inbox';

const Navbar = () => {
	const closeSidebar = () => {
		// setIsSidebarOpen(false);
	};

	return (
		<div className="flex h-full max-w-4xl flex-col items-center justify-center gap-y-10 rounded-md border p-3 shadow-md bg-base-100">
			<Inbox />
			<FriendsButton closeSidebar={closeSidebar} />
			<ExplorerButton closeSidebar={closeSidebar} />
			<div className="tooltip" data-tip="Settings">
				<button className="btn-ghost btn-sm btn btn-square">
					<HiCog className="text-3xl" />
				</button>
			</div>
			<LogoutButton />
		</div>
	);
};

export default Navbar;
