import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { HiOutlineMenu } from 'react-icons/hi';

import ChatRoomList from './ChatRoomList';
import CreateChatButton from './CreateChatButton';
import UserInfo from './UserInfo';

const Sidebar = () => {
	const { currentUser } = useUser();

	const [isOpen, setIsOpen] = useState<boolean>(false);

	return (
		<>
			<button className="fixed z-20 block sm:hidden" onClick={() => setIsOpen(!isOpen)}>
				<HiOutlineMenu className="text-3xl" />
			</button>

			<div className={`${isOpen ? 'absolute h-full sm:relative' : 'hidden'} z-40 bg-base-200 sm:block`}>
				{currentUser && currentUser.email && (
					<div className="flex h-full w-80 flex-col justify-between p-5 text-base-content">
						<div className="w-full items-end border-b pb-3 text-end sm:border-none">
							<button className="btn-circle btn float-right block sm:hidden" onClick={() => setIsOpen(false)}>
								x
							</button>
						</div>

						<div className="flex-1 py-5">
							<ChatRoomList chatRooms={currentUser.chats} />
						</div>

						<div>
							<CreateChatButton />
							<UserInfo />
						</div>
					</div>
				)}
			</div>

			{/* Overlay */}
			{isOpen && (
				<div className="fixed inset-0 z-30 block bg-black opacity-50 sm:hidden" onClick={() => setIsOpen(false)}></div>
			)}
		</>
	);
};

export default Sidebar;
