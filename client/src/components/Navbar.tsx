import { HiCog, HiChat } from 'react-icons/hi';

import ExplorerButton from './ExplorerButton';
import FriendsButton from './FriendsButton';
import LogoutButton from './LogoutButton';
import Inbox from './Inbox';
import { Dispatch, SetStateAction, useState } from 'react';
import Settings from './Settings';
import { createPortal } from 'react-dom';

interface Props {
	setIsSideOpen?: Dispatch<SetStateAction<boolean>>;
}

const Navbar = ({ setIsSideOpen }: Props) => {
	const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

	const closeSettings = () => {
		setIsSettingsOpen(false);
	};

	const closeSidebar = () => {
		if (setIsSideOpen) {
			setIsSideOpen(false);
		}
		closeSettings();
	};

	return (
		<div className="md:bg-base-100 flex h-full items-center justify-evenly md:justify-center gap-x-5 md:rounded-md border bg-gray-200 p-3 shadow-md md:flex-col md:gap-y-10">
			<div className="tooltip block md:hidden" data-tip="Chats">
				<button
					className="btn-ghost btn-sm btn btn-square"
					onClick={() => {
						if (isSettingsOpen) {
							setIsSettingsOpen(false);
						}
						setIsSideOpen!(true);
					}}
				>
					<HiChat className="text-3xl" />
				</button>
			</div>

			<Inbox />
			<FriendsButton closeSidebar={closeSidebar} />
			<ExplorerButton closeSidebar={closeSidebar} />
			<div className="tooltip" data-tip="Settings">
				<button
					className="btn-ghost btn-sm btn btn-square"
					onClick={() => {
						if (setIsSideOpen) {
							setIsSideOpen(false);
							setIsSettingsOpen(true);
						}
					}}
				>
					<HiCog className="text-3xl" />
				</button>
			</div>
			<LogoutButton />
			{isSettingsOpen && createPortal(<Settings closeSettings={closeSettings} />, document.body)}
		</div>
	);
};

export default Navbar;
