import { useState, useCallback, SetStateAction, Dispatch } from 'react';
import { HiCog } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

import defaultAvatar from '/default.jpg';
import LogoutButton from './LogoutButton';
import Settings from './Settings';
import { createPortal } from 'react-dom';
import { User } from '../types';
import ExplorerButton from './ExploreButton';
import CreateChatButton from './CreateChatButton';
import FriendsButton from './FriendsButton';

interface Props {
	currentUser: User;
	setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

const UserInfo = ({ currentUser, setIsSidebarOpen }: Props) => {
	const navigate = useNavigate();

	const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

	const closeSettings = useCallback(() => {
		setIsSettingsOpen(false);

		navigate('/');
	}, [navigate]);

	const closeSidebar = () => {
		setIsSidebarOpen(false);
	};

	return (
		<>
			<div className="bg-base-300 border-t">
				{currentUser && (
					<div className="flex flex-row items-center justify-evenly py-3">
						<div className="flex flex-row items-center gap-x-2">
							<div className="avatar">
								<div className="absolute -top-0.5 right-0 z-10 h-3 w-3 rounded-full border bg-green-500"></div>
								<div className="border-base-content w-8 rounded-full border">
									<img src={currentUser.avatar || defaultAvatar} width={20} height={20} alt="avatar" />
								</div>
							</div>
						</div>
						<CreateChatButton closeSidebar={closeSidebar} currentUserId={currentUser!.id} />
						<FriendsButton closeSidebar={closeSidebar} />
						<ExplorerButton closeSidebar={closeSidebar} />
						<div className="tooltip" data-tip="User Settings">
							<button className="btn-ghost btn-sm btn px-1" onClick={() => setIsSettingsOpen(true)}>
								<HiCog className="text-2xl" />
							</button>
						</div>
						<LogoutButton />
					</div>
				)}
			</div>
			{isSettingsOpen && createPortal(<Settings closeSettings={closeSettings} />, document.body)}
		</>
	);
};

export default UserInfo;
