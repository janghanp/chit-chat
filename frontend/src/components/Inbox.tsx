import { Fragment, useEffect, useState } from 'react';
import { HiX } from 'react-icons/hi';
import { HiBell } from 'react-icons/hi2';
import { SyncLoader } from 'react-spinners';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import produce from 'immer';

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
					return produce(old, (draftState) => {
						draftState.forEach((notification) => {
							notification.read = true;
						});
					});
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
	}, [isOpen, currentUser, checkNotificationMutate]);

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
		<div className="">
			<div className="tooltip" data-tip="Inbox">
				<button className="btn-ghost btn-sm btn px-1" onClick={() => setIsOpen(!isOpen)}>
					<div className="indicator">
						<span
							className={`badge-error badge badge-xs indicator-bottom indicator-item left-[8px] top-[7px] ${
								currentUser?.hasNewNotification ? 'block' : 'hidden'
							}`}
						></span>
						<HiBell className="text-2xl" />
					</div>
				</button>
			</div>

			{isOpen && (
				<div>
					{isLoading ? (
						<ul className="menu menu-compact absolute w-72 rounded-lg  bg-white p-3 shadow-lg">
							<SyncLoader size={10} color="#394E6A" margin={7} className="self-center" />
						</ul>
					) : (
						<>
							{isError ? (
								<div>Error...</div>
							) : (
								<div className="fixed top-5 left-5 bottom-[75px] z-30 w-full md:max-w-[320px]">
									<div className="bg-base-100 flex h-full w-full flex-col rounded-md">
										<div className="bg-base-300 rounded-none border-b p-5 sm:rounded-t-md">
											<div className="flex justify-between">
												<span className="text-3xl font-bold">Inbox</span>
												<button
													className="btn-outline btn-sm btn-circle btn flex bg-white"
													onClick={() => setIsOpen(!isOpen)}
												>
													<HiX />
												</button>
											</div>
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
												<button
													className="btn-outline btn-sm btn bg-white normal-case"
													onClick={readAllNotificationsHandler}
												>
													Mark all as read
												</button>
											</div>
										</div>
										{notificaionts.length === 0 ? (
											<div className="flex h-full items-center justify-center">
												<div className="font-mono font-semibold">You have no notifications...</div>
											</div>
										) : (
											<>
												{notificaionts.map((notification) => {
													return (
														<Fragment key={notification.id}>
															<Notification notification={notification} setIsOepn={setIsOpen} />
														</Fragment>
													);
												})}
											</>
										)}
									</div>
									<div onClick={() => setIsOpen(false)} className="fixed inset-0 -z-20"></div>
								</div>
							)}
						</>
					)}
				</div>
			)}
		</div>
	);
};

export default Inbox;
