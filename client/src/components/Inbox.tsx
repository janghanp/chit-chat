import { useState } from 'react';
import { HiInbox } from 'react-icons/hi';
import { SyncLoader } from 'react-spinners';

import useUser from '../hooks/useUser';
import { useQuery } from '@tanstack/react-query';
import { fetchNotifications } from '../api/notification';
import defaultAvatar from '/default.jpg';

const Inbox = () => {
	const { data: currentUser } = useUser();
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const { isLoading, isError, data } = useQuery({
		queryKey: ['notification'],
		queryFn: async () => fetchNotifications(currentUser!.id),
		enabled: isOpen,
	});

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
									<ul className="menu absolute -right-5 z-30 w-72 rounded-lg border bg-white p-3 shadow-lg sm:right-0 sm:w-[400px]">
										{data.map((notification) => {
											return (
												<li key={notification.id}>
													<a className="flex items-center">
														<div className="avatar">
															<div className="w-8 rounded-full border">
																<img src={notification.sender.avatar || defaultAvatar} alt={'?'} />
															</div>
														</div>
														<span>{notification.message}</span>
													</a>
												</li>
											);
										})}
									</ul>
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
