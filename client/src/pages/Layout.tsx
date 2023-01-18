import axios from 'axios';
import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

import { AuthErrorResponse } from '../types';
import useAuth from '../hooks/useAuth';
import { useUser } from '../context/UserContext';
import defaultAvatar from '/default.jpg';

const Layout = () => {
	const navigate = useNavigate();

	const auth = useAuth();

	const { currentUser } = useUser();

	const [roomName, setRoomName] = useState<string>('');
	const [toggleModal, setToggleModal] = useState<boolean>(false);

	const createChat = async () => {
		if (!roomName) {
			return;
		}

		// Check if a chat room to create already exists.
		try {
			await axios.post('http://localhost:8080/chat', { roomName: roomName }, { withCredentials: true });

			setToggleModal(false);

			// A chat room has been created and redirect a user to the Chat page.
			navigate(`/chat/${roomName}`);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 400) {
				//Chat room already exists.
				const serverError = error.response.data as AuthErrorResponse;
				alert(serverError.message);
				return;
			} else if (error instanceof Error) {
				console.log(error);
			}

			return;
		} finally {
			setRoomName('');
		}
	};

	return (
		<>
			<div className="drawer-mobile drawer">
				<input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
				<div className="drawer-content flex flex-col items-center justify-start">
					{/* <!-- Page content here --> */}
					<Outlet />
				</div>
				<div className="drawer-side bg-base-200">
					<label htmlFor="my-drawer-2" className="drawer-overlay"></label>
					{/* <!-- Sidebar content here --> */}
					<ul className="menu flex w-80  flex-col justify-between  p-4 text-base-content">
						{/* Room list */}
						<div>
							{currentUser &&
								currentUser.chats &&
								currentUser.chats.map((chat) => {
									return (
										<li key={chat.id}>
											<Link to={`/chat/${chat.name}`}>{chat.name}</Link>
										</li>
									);
								})}
						</div>

						{/* User Info */}
						{currentUser && currentUser.email && (
							<div>
								<button className="rounded-md border p-2" onClick={() => setToggleModal(!toggleModal)}>
									Creaet a chat
								</button>
								<img className="border" src={currentUser.avatar || defaultAvatar} width={50} height={50} alt="avatar" />
								<span>{currentUser.username}</span>
								<button
									className="w-full border"
									onClick={() => {
										auth.logout();
										window.location.reload();
									}}
								>
									Log out
								</button>
								<Link to="/settings">
									<button className="w-full border">config</button>
								</Link>
							</div>
						)}
					</ul>
				</div>
			</div>

			{toggleModal && (
				<>
					<div
						className="fixed inset-0 top-0 z-10  flex items-center justify-center bg-black opacity-40"
						onClick={(e) => {
							e.stopPropagation();
							setToggleModal(false);
						}}
					></div>
					<div className="fixed left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 border bg-white">
						<label>Create a chat</label>
						<input className="border" type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
						<button onClick={createChat}>Creat a chat</button>
					</div>
				</>
			)}
		</>
	);
};

export default Layout;
