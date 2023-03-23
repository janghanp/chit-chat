import { useState, useCallback } from 'react';
import { HiCog } from 'react-icons/hi';

import defaultAvatar from '/default.jpg';
import LogoutButton from './LogoutButton';
import Settings from './Settings';
import { createPortal } from 'react-dom';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';

interface Props {
	currentUser: User;
}

const UserInfo = ({ currentUser }: Props) => {
	const navigate = useNavigate();

	const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

	const closeSettings = useCallback(() => {
		setIsSettingsOpen(false);

		navigate('/');
	}, []);

	return (
		<>
			<div className="border-t bg-base-300">
				{currentUser && (
					<div className="flex flex-row items-center justify-evenly py-3">
						{/* Avatar */}
						<div className="flex flex-row items-center gap-x-2">
							<div className="avatar">
								<div className="absolute -top-0.5 right-0 z-10 h-3 w-3 rounded-full border bg-green-500"></div>
								<div className="w-8 rounded-full">
									<img src={currentUser.avatar || defaultAvatar} width={20} height={20} alt="avatar" />
								</div>
							</div>
							<span className="text-sm font-semibold">{currentUser.username}</span>
						</div>
						<div className="tooltip" data-tip="User settings">
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
