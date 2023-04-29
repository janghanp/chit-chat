import { HiCog } from 'react-icons/hi';

import ExplorerButton from './ExplorerButton';
import FriendsButton from './FriendsButton';
import LogoutButton from './LogoutButton';
import Inbox from './Inbox';
import { useState } from 'react';
import Settings from './Settings';
import { createPortal } from 'react-dom';

const Navbar = () => {
	const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

	const closeSidebar = () => {
		// setIsSidebarOpen(false);
	};

	const closeSettings = () => {
		setIsSettingsOpen(false);
	};

	return (
		<div className="bg-base-100 flex h-full max-w-4xl flex-col items-center justify-center gap-y-10 rounded-md border p-3 shadow-md">
			<Inbox />
			<FriendsButton closeSidebar={closeSidebar} />
			<ExplorerButton closeSidebar={closeSidebar} />
			<div className="tooltip" data-tip="Settings">
				<button className="btn-ghost btn-sm btn btn-square" onClick={() => setIsSettingsOpen(true)}>
					<HiCog className="text-3xl" />
				</button>
			</div>
			<LogoutButton />
			{isSettingsOpen && createPortal(<Settings closeSettings={closeSettings} />, document.body)}
		</div>
	);
};

export default Navbar;
