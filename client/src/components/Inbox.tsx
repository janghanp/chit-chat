import { useState } from 'react';
import { HiInbox } from 'react-icons/hi';
import { SyncLoader } from 'react-spinners';
import { formatDistance, subDays } from 'date-fns';

import useUser from '../hooks/useUser';
import { useQuery } from '@tanstack/react-query';
import { fetchNotifications } from '../api/notification';
import defaultAvatar from '/default.jpg';
import { Notification } from '../types';

const Inbox = () => {
	const { data: currentUser } = useUser();
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const { isLoading, isError, data } = useQuery<Notification[]>({
		queryKey: ['notification'],
		queryFn: async () => fetchNotifications(currentUser!.id),
		enabled: isOpen,
	});

	const acceptFriendRequest = () => {
		//connect two users and delete the notification.
		//create another notification to the user saying that you have accepted the request and mark as read. (in this case sender and receiver is going to be the same.)
		//change notifiaction cache.
	};

	const ignoreFriendRequest = () => {
		//just delete the notification from database.
		//change notification cache.
	};

	if (data) {
		console.log(data);
	}

	return (
		<div className="relative">
			<div className="tooltip tooltip-bottom z-30" data-tip="Inbox">
				<button className="btn-ghost btn-sm btn px-1" onClick={() => setIsOpen(!isOpen)}>
					<HiInbox className="text-2xl" />
				</button>
			</div>
			{isOpen && (
				<>
					{isLoading ? (
						<ul className="menu menu-compact absolute -right-5 w-72 rounded-lg border bg-white p-3 shadow-lg sm:right-0 sm:w-[400px]">
							<SyncLoader size={10} color="#394E6A" margin={7} className="self-center" />
						</ul>
					) : (
						<>
							{isError ? (
								<div>Error...</div>
							) : (
								<>
									<div className="absolute -right-5 z-30 flex w-96 flex-col rounded-lg border bg-white shadow-lg sm:right-0 sm:w-[400px]">
										{data.map((notification) => {
											return (
												<div
													key={notification.id}
													className="flex items-start gap-x-2 p-2 transition duration-300 hover:bg-gray-200"
												>
													<div className="avatar">
														<div className="w-10 rounded-full border">
															<img src={notification.sender.avatar || defaultAvatar} alt={'?'} />
														</div>
													</div>
													<div className="flex flex-col items-start">
														<div>
															<span className="mr-2 text-sm font-bold">{notification.sender.username}</span>
															<span className="text-sm">{notification.message}</span>
														</div>
														<span className="my-1 text-xs font-bold">
															{formatDistance(subDays(new Date(notification.createdAt), 0), new Date(), {
																addSuffix: true,
															})}
														</span>
														<div className="flex gap-x-2">
															<button className="btn-success btn-sm btn normal-case" onClick={acceptFriendRequest}>
																Accept
															</button>
															<button
																className="btn-outline btn-ghost btn-sm btn normal-case"
																onClick={ignoreFriendRequest}
															>
																Ignore
															</button>
														</div>
													</div>
												</div>
											);
										})}
									</div>
									<div onClick={() => setIsOpen(false)} className="fixed inset-0"></div>
								</>
							)}
						</>
					)}
				</>
			)}
		</div>
	);
};

export default Inbox;
