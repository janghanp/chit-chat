import { useEffect, useState } from 'react';
import { HiInbox } from 'react-icons/hi';
import { SyncLoader } from 'react-spinners';
import { formatDistance, subDays } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import useUser from '../hooks/useUser';
import { deleteNotification, fetchNotifications } from '../api/notification';
import defaultAvatar from '/default.jpg';
import { Notification } from '../types';
import { checkNotification } from '../api/user';
import { addFriend } from '../api/user';
import useCreateNotification from '../hooks/useCreateNotification';

const Inbox = () => {
	const queryClient = useQueryClient();
	const { data: currentUser } = useUser();
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const { isLoading, isError, data } = useQuery<Notification[]>({
		queryKey: ['notification'],
		queryFn: async () => fetchNotifications(currentUser!.id),
	});
	const { mutate: createNotificationMutate } = useCreateNotification();
	const { mutate: deleteNotificationMutate } = useMutation({
		mutationFn: async ({ notificationId }: { notificationId: string }) => deleteNotification(notificationId),
		onSuccess: (data, variables, context) => {
			const { notificationId } = variables;

			queryClient.setQueryData(['notification'], (old: any) => {
				return old.filter((notificaion: any) => notificaion.id !== notificationId);
			});
		},
		onError: (error) => {
			console.log(error);
		},
	});
	const { mutate: checkNotificationMutate } = useMutation({
		mutationFn: async ({ userId }: { userId: string }) => checkNotification(userId),
		onSuccess: (data, variables, context) => {
			queryClient.setQueryData(['currentUser'], (old: any) => {
				return { ...old, hasNewNotification: false };
			});
		},
		onError: (error) => {
			console.log(error);
		},
	});
	const { mutate: addFriendMutate } = useMutation({
		mutationFn: async ({
			receiverId,
			senderId,
			notification,
		}: {
			receiverId: string;
			senderId: string;
			notification: Notification;
		}) => addFriend(senderId, receiverId),
		onSuccess: (data, variables, context) => {
			const { notification } = variables;

			queryClient.setQueryData(['notification'], (old: any) => {
				notification.message = `You accpeted ${notification.sender.username}' s friend request`;
				notification.createdAt = new Date().toISOString();
				notification.read = true;
				notification.temp = true;

				return [...old, notification];
			});
		},
		onError: (error) => {
			console.log(error);
		},
	});

	useEffect(() => {
		if (isOpen && currentUser?.hasNewNotification) {
			checkNotificationMutate({ userId: currentUser.id });
		}
	}, [isOpen, currentUser]);

	const acceptFriendRequest = (notification: Notification) => {
		deleteNotificationMutate({ notificationId: notification.id });
		addFriendMutate({ receiverId: currentUser!.id, senderId: notification.senderId, notification });

		createNotificationMutate({
			senderId: currentUser!.id,
			receiverId: notification.senderId,
			message: 'has accepted your friend request',
		});
	};

	const ignoreFriendRequest = (notificationId: string) => {
		deleteNotificationMutate({ notificationId });
	};

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
										<div className="border-b bg-base-300 p-5 text-2xl font-bold">Inbox</div>
										{data.map((notification) => {
											return (
												<div
													key={notification.id}
													className="flex items-start gap-x-2 p-2 transition duration-300 hover:bg-gray-200/50"
												>
													<div className="avatar">
														<div className="w-10 rounded-full border">
															<img src={notification.sender.avatar || defaultAvatar} alt={'?'} />
														</div>
													</div>
													<div className={`flex flex-col items-start ${notification.read && 'text-gray-400'}`}>
														<div>
															{!notification.temp && (
																<span className="mr-2 text-sm font-bold">{notification.sender.username}</span>
															)}
															<span className="text-sm">{notification.message}</span>
														</div>
														<span className="my-1 text-xs font-bold">
															{formatDistance(subDays(new Date(notification.createdAt), 0), new Date(), {
																addSuffix: true,
															})}
														</span>
														{notification.message.includes('sent') && (
															<div className="flex gap-x-2">
																<button
																	className="btn-success btn-sm btn normal-case"
																	onClick={() => acceptFriendRequest(notification)}
																>
																	Accept
																</button>
																<button
																	className="btn-outline btn-ghost btn-sm btn normal-case"
																	onClick={() => ignoreFriendRequest(notification.id)}
																>
																	Ignore
																</button>
															</div>
														)}
													</div>
													{!notification.read && (
														<div className="flex h-full flex-1 justify-center pt-5">
															<span className="badge badge-success badge-xs indicator-item"></span>
														</div>
													)}
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
