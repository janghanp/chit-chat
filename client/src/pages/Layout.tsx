import axios from 'axios';
import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

import { AuthErrorResponse } from '../types';
import { useUser } from '../context/UserContext';
import UserInfo from '../components/UserInfo';
import CreateChatButton from '../components/CreateChatButton';

const Layout = () => {
	const navigate = useNavigate();

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
				<div className="bg-base-200 flex">
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

						{currentUser && currentUser.email && (
							<div>
								<CreateChatButton toggleModal={() => setToggleModal(!toggleModal)} />
								<UserInfo />
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
