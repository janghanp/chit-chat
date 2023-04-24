import { memo } from 'react';
import { formatDistance, subDays } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Friend, Notification as NotificationType } from '../types';
import defaultAvatar from '/default.jpg';
import { addFriend } from '../api/user';
import useCreateNotification from '../hooks/useCreateNotification';
import { deleteNotification, readNotification } from '../api/notification';
import useUser from '../hooks/useUser';
import { socket } from '../socket';

interface Props {
	notification: NotificationType;
}

const Notification = ({ notification }: Props) => {
	const queryClient = useQueryClient();
	const { data: currentUser } = useUser();
	const { mutate: createNotificationMutate } = useCreateNotification();
	const { mutate: addFriendMutate } = useMutation({
		mutationFn: async ({
			receiverId,
			senderId,
			notification,
		}: {
			receiverId: string;
			senderId: string;
			notification: NotificationType;
		}) => addFriend(senderId, receiverId),
		onSuccess: (data, variables, context) => {
			const { notification } = variables;

			queryClient.setQueryData<NotificationType[]>(['notifications'], (old) => {
				if (old) {
					notification.message = `You accpeted ${notification.sender.username}' s friend request`;
					notification.createdAt = new Date().toISOString();
					notification.read = true;
					notification.temp = true;

					return [...old, notification];
				}
			});

			queryClient.setQueryData<Friend[]>(['friends'], (old) => {
				if (old) {
					return [
						...old,
						{ id: notification.senderId, avatar: notification.sender.avatar, username: notification.sender.username },
					];
				}
			});
		},
		onError: (error) => {
			console.log(error);
		},
	});
	const { mutate: deleteNotificationMutate } = useMutation({
		mutationFn: async ({ notificationId }: { notificationId: string }) => deleteNotification(notificationId),
		onSuccess: (data, variables, context) => {
			const { notificationId } = variables;

			queryClient.setQueryData<Notification[]>(['notifications'], (old) => {
				if (old) {
					return old.filter((notificaion: any) => notificaion.id !== notificationId);
				}
			});
		},
		onError: (error) => {
			console.log(error);
		},
	});
	const { mutate: readNotificationMutate } = useMutation({
		mutationFn: async ({ notificationId }: { notificationId: string }) => readNotification(notificationId),
		onSuccess: (data, variables, context) => {
			const { notificationId } = variables;
			queryClient.setQueryData<NotificationType[]>(['notifications'], (old) => {
				if (old) {
					const newNotification = old.map((notification) => {
						if (notification.id === notificationId) {
							notification.read = true;
							return { ...notification };
						}
						return notification;
					});

					return newNotification;
				}
			});
		},
		onError: (error) => {
			console.log(error);
		},
	});

	const acceptFriendRequest = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.stopPropagation();

		deleteNotificationMutate({ notificationId: notification.id });
		addFriendMutate({ receiverId: currentUser!.id, senderId: notification.senderId, notification });

		createNotificationMutate({
			senderId: currentUser!.id,
			receiverId: notification.senderId,
			message: 'has accepted your friend request',
		});

		socket.emit('accept_friend', {
			id: currentUser!.id,
			avatar: currentUser!.avatar,
			username: currentUser!.username,
			receiverId: notification.senderId,
		});
	};

	const ignoreFriendRequest = () => {
		deleteNotificationMutate({ notificationId: notification.id });
	};

	const readNotificationHandler = () => {
		if (!notification.read) {
			readNotificationMutate({ notificationId: notification.id });
		}
	};

	return (
		<div
			key={notification.id}
			className="flex items-start gap-x-2 p-2 transition duration-300 hover:cursor-pointer hover:bg-gray-200/50 border-b"
			onClick={readNotificationHandler}
		>
			<div className="avatar">
				<div className="w-10 rounded-full border">
					<img src={notification.sender.avatar || defaultAvatar} alt={'?'} />
				</div>
			</div>
			<div className={`flex flex-col items-start ${notification.read && 'text-gray-400'}`}>
				<div>
					{!notification.temp && <span className="mr-2 text-sm font-bold">{notification.sender.username}</span>}
					<span className="text-sm">{notification.message}</span>
				</div>
				<span className="my-1 text-xs font-bold">
					{formatDistance(subDays(new Date(notification.createdAt), 0), new Date(), {
						addSuffix: true,
					})}
				</span>
				{notification.message.includes('sent') && (
					<div className="flex gap-x-2">
						<button className="btn-success btn-sm btn normal-case" onClick={acceptFriendRequest}>
							Accept
						</button>
						<button className="btn-outline btn-ghost btn-sm btn normal-case" onClick={ignoreFriendRequest}>
							Ignore
						</button>
					</div>
				)}
			</div>
			{!notification.read && (
				<div className="flex h-full flex-1 justify-center pt-5">
					<span className="badge-success badge badge-xs indicator-item"></span>
				</div>
			)}
		</div>
	);
};

export default memo(Notification);
