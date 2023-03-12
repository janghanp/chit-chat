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
			<div className="fixed top-0 z-20 block h-10 w-full border-b pt-1 pl-5 shadow-md sm:hidden">
				<button className="" onClick={() => setIsOpen(!isOpen)}>
					<HiOutlineMenu className="text-3xl" />
				</button>
			</div>

			<div
				className={`${
					!isOpen && '-translate-x-96'
				} fixed z-40 h-full bg-base-200 duration-200 ease-linear sm:relative sm:translate-x-0`}
			>
				{currentUser && currentUser.email && (
					<div className="flex h-full w-80 flex-col justify-between p-5 text-base-content">
						<div className="w-full items-end border-b pb-3 text-end opacity-100 sm:opacity-0">
							<div className="tooltip tooltip-bottom" data-tip="Esc">
								<button
									className="btn-outline btn-ghost btn-circle btn float-right sm:cursor-default"
									onClick={() => setIsOpen(false)}
								>
									x
								</button>
							</div>
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
