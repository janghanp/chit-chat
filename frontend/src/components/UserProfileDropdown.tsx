import { Dispatch, SetStateAction } from 'react';
import LogoutButton from './LogoutButton';
import SettingsButton from './SettingsButton';

interface Props {
	setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const UserProfileDropdown = ({ setIsOpen }: Props) => {
	return (
		<>
			<div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)}></div>
			<div className="absolute bottom-12 z-30">
				<ul className="menu bg-base-100 rounded-box menu-compact w-52 p-2 shadow">
					<li>
						<SettingsButton closeSidebar={() => console.log('test')} setIsOpen={setIsOpen} />
					</li>
					<li>
						<LogoutButton />
					</li>
				</ul>
			</div>
		</>
	);
};

export default UserProfileDropdown;
