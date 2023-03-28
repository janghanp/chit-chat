import { createPortal } from 'react-dom';
import { HiOutlineLogout } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { socket } from '../socket';
import { logOutUser } from '../api/user';

const LogoutButton = () => {
	const navigate = useNavigate();

	const queryClient = useQueryClient();

	const { mutate } = useMutation({
		mutationFn: () => logOutUser(),
		onSuccess() {
			queryClient.removeQueries({ queryKey: ['currentUser'] });
			queryClient.removeQueries({ queryKey: ['chatRooms'] });
			queryClient.removeQueries({ queryKey: ['chat'] });
			queryClient.removeQueries({ queryKey: ['messages'] });

			navigate('/login');
		},
		onError(error: AxiosError | Error) {
			if (axios.isAxiosError(error)) {
				console.log(error.response?.data);
			}
		},
	});

	const handleLogout = () => {
		mutate();
		queryClient.removeQueries({ queryKey: ['currentUser'], exact: true });

		socket.disconnect();
	};

	return (
		<>
			<div className="tooltip" data-tip="Log Out">
				<label htmlFor="modal-1" className="btn-ghost btn-sm btn px-1">
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
