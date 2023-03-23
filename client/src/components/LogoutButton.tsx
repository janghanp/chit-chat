import { createPortal } from 'react-dom';
import { HiOutlineLogout } from 'react-icons/hi';

import useAuth from '../hooks/useAuth';
import { useCurrentUserStore } from '../store';
import { socket } from '../socket';

const LogoutButton = () => {
	const { logout } = useAuth();

	const { setCurrentUser, currentUser } = useCurrentUserStore();

	const handleLogout = () => {
		logout();

		socket.disconnect();

		setCurrentUser(null);
	};

	return (
		<>
			<div className="tooltip" data-tip="Log Out">
				<label htmlFor="modal-1" className="btn-ghost btn-sm btn px-2">
					<HiOutlineLogout className="text-2xl" />
				</label>
			</div>

			{createPortal(
				<div>
					<input type="checkbox" id="modal-1" className="modal-toggle fixed inset-0" />

					<label htmlFor="modal-1" className="modal">
						<label className="modal-box">
							<h3 className="text-xl font-bold">Log out</h3>

							<p className="py-4">Are you sure you want to log out?</p>

							<div className="flex flex-row items-center justify-end gap-x-5">
								<label htmlFor="modal-1" className="btn-ghost btn-md btn">
									cancel
								</label>
								<label className="btn-error btn-md btn" onClick={handleLogout}>
									Log Out
								</label>
							</div>
						</label>
					</label>
				</div>,
				document.body
			)}
		</>
	);
};

export default LogoutButton;
