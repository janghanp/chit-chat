import { Outlet } from 'react-router-dom';

import { useUser } from '../context/UserContext';
import UserInfo from '../components/UserInfo';
import CreateChatButton from '../components/CreateChatButton';
import ChatRoomList from '../components/ChatRoomList';

const Layout = () => {
	const { currentUser } = useUser();

	return (
		<>
			<div className="drawer-mobile drawer">
				<input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

				{/* <!-- Page content here --> */}
				<div className="drawer-content flex flex-col items-center justify-start">
					<Outlet />
				</div>

				{/* <!-- Sidebar content here --> */}
				<div className="flex bg-base-200">
					<label htmlFor="my-drawer-2" className="drawer-overlay"></label>

					{currentUser && currentUser.email && (
						<div className="flex w-80 flex-col justify-between  p-4 text-base-content">
							<ChatRoomList chatRooms={currentUser.chats} />

							<div>
								<CreateChatButton />
								<UserInfo />
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default Layout;
