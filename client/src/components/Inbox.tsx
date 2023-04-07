import { Fragment, useEffect, useState } from 'react';
import { HiInbox, HiCheck } from 'react-icons/hi';
import { SyncLoader } from 'react-spinners';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import useUser from '../hooks/useUser';
import { fetchNotifications, readAllNotifications } from '../api/notification';
import { Notification as NotificationType, User } from '../types';
import { checkNotification } from '../api/user';
import Notification from './Notification';

const Inbox = () => {
	const queryClient = useQueryClient();
	const { data: currentUser } = useUser();
	const { isLoading, isError, data } = useQuery({
		queryKey: ['notifications'],
		queryFn: async () => fetchNotifications(currentUser!.id),
	});
	const { mutate: checkNotificationMutate } = useMutation({
		mutationFn: async ({ userId }: { userId: string }) => checkNotification(userId),
		onSuccess: (data, variables, context) => {
			queryClient.setQueryData<User>(['currentUser'], (old) => {
				if (old) {
					return { ...old, hasNewNotification: false };
				}
			});
		},
		onError: (error) => {
			console.log(error);
		},
	});
	const { mutate: readAllNotificaionMutate } = useMutation({
		mutationFn: async () => readAllNotifications(),
		onSuccess: (data) => {
			queryClient.setQueryData<NotificationType[]>(['notifications'], (old) => {
				if (old) {
					const newNotifications = old.map((notification) => {
						notification.read = true;
						return notification;
					});

					return newNotifications;
				}
			});
		},
		onError: (error) => {
			console.log(error);
		},
	});
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [filter, setFilter] = useState<'all' | 'unread'>('all');

	useEffect(() => {
		if (isOpen && currentUser?.hasNewNotification) {
			checkNotificationMutate({ userId: currentUser.id });
		}
	}, [isOpen, currentUser]);

	const readAllNotificationsHandler = () => {
		if (data?.map((notification) => notification.read).includes(false)) {
			readAllNotificaionMutate();
		}
	};

	let notificaionts: NotificationType[] = [];

	if (data && filter === 'all') {
		notificaionts = data;
	}

	if (data && filter === 'unread') {
		notificaionts = data.filter((notification) => !notification.read);
	}

	return (
		<div className="relative">
			<div className="tooltip tooltip-bottom z-30" data-tip="Inbox">
				<button className="btn-ghost btn-sm btn px-1" onClick={() => setIsOpen(!isOpen)}>
					<div className="indicator">
						<span
							className={`indicator-bottom badge badge-error badge-xs indicator-item left-[8px] top-[7px] ${
								currentUser?.hasNewNotification ? 'block' : 'hidden'
							}`}
						></span>
						<HiInbox className="text-2xl" />
					</div>
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
									<div className="absolute -right-5 z-30 flex w-96 flex-col rounded-xl border bg-white shadow-lg sm:right-0 sm:w-[400px]">
										<div className="border-b bg-base-300 p-5">
											<span className="text-2xl font-bold">Inbox</span>
											<div className="mt-5 flex justify-between">
												<div>
													<button
														className={`btn-outline btn-sm btn bg-base-100 normal-case ${
															filter === 'all' ? 'bg-base-content text-white' : ''
														} mr-3`}
														onClick={() => setFilter('all')}
													>
														All
													</button>
													<button
														className={`btn-outline btn-sm btn bg-base-100 normal-case ${
															filter === 'unread' ? 'bg-base-content text-white' : ''
														}`}
														onClick={() => setFilter('unread')}
													>
														Unread
													</button>
												</div>
												<div className="tooltip" data-tip="Mark All as Read">
													<button
														className="btn-outline btn-sm btn-circle btn bg-white"
														onClick={readAllNotificationsHandler}
													>
														<HiCheck />
													</button>
												</div>
											</div>
										</div>
										{notificaionts.map((notification) => {
											return (
												<Fragment key={notification.id}>
													<Notification notification={notification} />
												</Fragment>
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
