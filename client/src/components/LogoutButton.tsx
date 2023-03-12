import { HiOutlineLogout } from 'react-icons/hi';

import useAuth from '../hooks/useAuth';

const LogoutButton = () => {
	const auth = useAuth();

	const handleLogout = () => {
		auth.logout();
		window.location.reload();
	};

	return (
		<>
			<div className="tooltip" data-tip="Log Out">
				<label htmlFor="modal-1" className="btn-ghost btn-sm btn-circle btn text-2xl">
					<HiOutlineLogout />
				</label>
			</div>

			<input type="checkbox" id="modal-1" className="modal-toggle fixed inset-0" />

			<label htmlFor="modal-1" className="modal">
				<label className="modal-box">
					<h3 className="text-xl font-bold">Log out</h3>
					<p className="py-4">Are you sure you want to log out?</p>
					<div className="flex flex-row items-center justify-end gap-x-5">
						<label htmlFor="modal-1" className="btn-ghost btn-md btn">
							cancel
						</label>
						<button className="btn-error btn-md btn" onClick={handleLogout}>
							Log Out
						</button>
					</div>
				</label>
			</label>
		</>
	);
};

export default LogoutButton;
