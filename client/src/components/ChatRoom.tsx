import { Dispatch, memo, SetStateAction, useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import produce from 'immer';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

import { Chat, User } from '../types';
import useUser from '../hooks/useUser';
import defaultAvatar from '/default.jpg';

interface Props {
	chatRoom: Chat;
	setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

const ChatRoom = ({ chatRoom, setIsSidebarOpen }: Props) => {
	const { chatId } = useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: currentUser } = useUser();
	const [isNewMessage, setIsNewMessage] = useState<boolean>(false);
	const [receiverAvatar, setReceiverAvatar] = useState<string | undefined>('');
	const [receiverUsername, setReceiverUsername] = useState<string | undefined>('');
	const receiverRef = useRef<boolean>(false);

	// When it is a private chat, set the receiver avatar as a chat icon.
	useEffect(() => {
		if (chatRoom.type === 'PRIVATE') {
			const fetchReceiver = async () => {
				const { data } = await axios.get<User>('/chat/private', {
					withCredentials: true,
					params: {
						chatId: chatRoom.id,
						userId: currentUser!.id,
					},
				});

				if (data) {
					setReceiverAvatar(data.avatar);
					setReceiverUsername(data.username);
					receiverRef.current = true;
				}
			};

			if (currentUser && !receiverRef.current) {
				fetchReceiver();
			}
		}
	}, [currentUser]);

	// Set new message indicator.
	useEffect(() => {
		if (!chatRoom.readBy.includes(currentUser!.id) && chatId !== chatRoom.id) {
			setIsNewMessage(true);
		}
	}, [chatRoom]);

	// Mark as read.
	useEffect(() => {
		if (chatId === chatRoom.id) {
			axios.patch('/chat/read', { chatId, userId: currentUser!.id }, { withCredentials: true });

			queryClient.setQueryData(['chatRooms'], (old: any) => {
				return produce(old, (draftState: Chat[]) => {
					draftState.forEach((chat: Chat) => {
						if (chat.id === chatId) {
							if (!chat.readBy.includes(currentUser!.id)) {
								chat.readBy.push(currentUser!.id);
							}
						}
					});
				});
			});

			setIsNewMessage(false);

			return () => {
				axios.patch('/chat/read', { chatId, userId: currentUser!.id }, { withCredentials: true });
			};
		}
	}, [chatId]);

	const clickHandler = async () => {
		setIsSidebarOpen(false);

		navigate(`/chat/${chatRoom.id}`);
	};

	const hasMessage = chatRoom.messages!.length > 0 ? true : false;

	let isToday: boolean = true;

	if (hasMessage) {
		const gap = new Date().getTime() - new Date(chatRoom.messages![0].createdAt).getTime();
		// 86400000 = 24 hours
		isToday = gap < 86400000;
	}

	return (
		<tr className={`hover:cursor-pointer ${chatId === chatRoom.id ? 'active' : ''} w-full`} onClick={clickHandler}>
			<th className="w-full rounded-none p-3">
				<div className="flex items-center justify-start gap-x-3">
					<div className="indicator">
						<span
							className={`badge badge-primary badge-xs indicator-item right-1 top-1 ${
								isNewMessage ? 'block' : 'hidden'
							}`}
						></span>
						{chatRoom.icon ? (
							<div className="avatar">
								<div className="w-10 rounded-full">
									<img src={chatRoom.icon} alt={chatRoom.name} />
								</div>
							</div>
						) : (
							<>
								{chatRoom.name ? (
									<div className="placeholder avatar">
										<div className="w-10 rounded-full bg-neutral-focus text-neutral-content">
											<span>{chatRoom.name.charAt(0).toUpperCase()}</span>
										</div>
									</div>
								) : (
									<div>
										<div className="avatar">
											<div className="w-10 rounded-full border">
												<img src={receiverAvatar || defaultAvatar} alt="receiver" />
											</div>
										</div>
									</div>
								)}
							</>
						)}
					</div>
					<div className="flex w-full flex-col">
						<span className="flex w-full items-center justify-between font-semibold">
							<span>{chatRoom.name || receiverUsername}</span>
							<span>
								<time className="ml-2 text-xs opacity-50">
									{!hasMessage ? (
										''
									) : (
										<>
											{isToday && hasMessage ? (
												<>{format(new Date(chatRoom.messages![0].createdAt), 'p')}</>
											) : (
												<>{format(new Date(chatRoom.messages![0].createdAt), 'MM/dd')}</>
											)}
										</>
									)}
								</time>
							</span>
						</span>
						<span className="text-sm font-normal">
							{hasMessage && (
								<>
									{chatRoom.messages![0].sender.username}: {chatRoom.messages![0].text}
								</>
							)}
						</span>
					</div>
				</div>
			</th>
		</tr>
	);
};

export default memo(ChatRoom);
