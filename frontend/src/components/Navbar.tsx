import ExplorerButton from './ExplorerButton';
import FriendsButton from './FriendsButton';
import LogoutButton from './LogoutButton';
import Inbox from './Inbox';
import { Dispatch, SetStateAction } from 'react';
import SettingsButton from './SettingsButton';

interface Props {
	setIsSideOpen?: Dispatch<SetStateAction<boolean>>;
}

const Navbar = ({ setIsSideOpen }: Props) => {
	const closeSidebar = () => {
		if (setIsSideOpen) {
			setIsSideOpen(false);
		}
	};

	return (
		<div className="md:bg-base-100 fixed bottom-0 z-30 flex h-[52px] w-full  items-center justify-evenly gap-x-5 border bg-gray-200 p-3 shadow-md md:relative md:h-full md:flex-col md:justify-center md:gap-y-10 md:rounded-md">
			<Inbox />
			<FriendsButton closeSidebar={closeSidebar} />
			<ExplorerButton closeSidebar={closeSidebar} />
			<SettingsButton closeSidebar={closeSidebar} />
			<LogoutButton />
		</div>
	);
};

export default Navbar;
