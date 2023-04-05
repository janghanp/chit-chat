import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { User } from '../types';
import defaultAvatar from '/default.jpg';
import useUser from '../hooks/useUser';
import { createPrivateChat } from '../api/chat';
import { createNotification } from '../api/notification';
import { socket } from '../socket';

interface Props {
	member: User;
}

const Member = ({ member }: Props) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: currentUser } = useUser();
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const { mutate: createPrivateChatMutate } = useMutation({
		mutationFn: ({ senderId, receiverId }: { senderId: string; receiverId: string }) => {
			return createPrivateChat(senderId, receiverId);
		},
		onSuccess: async (data) => {
			if (!data.isPrevious) {
				queryClient.setQueryData(['chatRooms'], (old: any) => {
					return [...old, data];
				});

				navigate(`/chat/${data.id}`);
				return;
			}

			navigate(`/chat/${data.previousChat.id}`);
		},
		onError: (error: any) => {
			console.log(error);
		},
	});
	const { mutate: createNotificationMutate } = useMutation({
		mutationFn: ({ message, receiverId, senderId }: { message: string; receiverId: string; senderId: string }) => {
			return createNotification(message, receiverId, senderId);
		},
		onSuccess: async (data) => {
			console.log('notificaion created!');
			socket.emit('send_notification', { ...data });
		},
		onError: (error: any) => {
			console.log(error);
		},
	});

	const createPrivateChatHandler = async () => {
		createPrivateChatMutate({ senderId: currentUser!.id, receiverId: member.id });
	};

	const requestFriendHandler = async () => {
		//manipulate message.
		createNotificationMutate({
			receiverId: member.id,
			message: `has sent you a friend request`,
			senderId: currentUser!.id,
		});
	};

	return (
		<div className="relative">
			<div
				className="flex flex-row items-center justify-start gap-x-3 rounded-md py-1.5 px-2 transition duration-200 hover:cursor-pointer hover:bg-base-300"
				onClick={currentUser?.id === member.id ? () => {} : () => setIsOpen(!isOpen)}
			>
				<div className="avatar">
					<div
						className={`absolute -top-0.5 right-0 z-10 h-3 w-3 rounded-full border ${
							member.isOnline ? 'bg-green-500' : 'bg-gray-400'
						} `}
					></div>
					<div className="w-8 rounded-full">
						<img src={member.avatar || defaultAvatar} alt="avatar" />
					</div>
				</div>
				<span className="text-sm font-semibold">{member.username}</span>
			</div>

			{isOpen && (
				<>
					<ul className="menu menu-compact absolute top-0 -left-[210px] z-40 w-52 rounded-lg border bg-base-100 p-2 shadow">
						<li onClick={createPrivateChatHandler}>
							<a>private chat</a>
						</li>
						<li onClick={requestFriendHandler}>
							<a>Add Friend</a>
						</li>
					</ul>
					<div onClick={() => setIsOpen(false)} className="fixed inset-0"></div>
				</>
			)}
		</div>
	);
};

export default Member;
