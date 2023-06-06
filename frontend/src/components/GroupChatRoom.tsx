import { Dispatch, memo, SetStateAction, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import produce from 'immer';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

import { Chat } from '../types';
import useUser from '../hooks/useUser';

interface Props {
	groupChatRoom: Chat;
	setIsSidebarOpen?: Dispatch<SetStateAction<boolean>>;
}

const GroupChatRoom = ({ groupChatRoom, setIsSidebarOpen }: Props) => {
	const { chatId } = useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: currentUser } = useUser();
	const [isNewMessage, setIsNewMessage] = useState<boolean>(false);

	// Set new message indicator.
	useEffect(() => {
		if (!groupChatRoom.readBy.includes(currentUser!.id) && chatId !== groupChatRoom.id) {
			setIsNewMessage(true);
		}
	}, [groupChatRoom, currentUser, chatId]);

	// Mark as read.
	useEffect(() => {
		if (chatId === groupChatRoom.id) {
			axios.patch('/chat/read', { chatId, userId: currentUser!.id }, { withCredentials: true });

			queryClient.setQueryData<Chat[]>(['groupChatRooms'], (old) => {
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
	}, [chatId, queryClient, currentUser, groupChatRoom.id]);

	const clickHandler = async () => {
		if (setIsSidebarOpen) {
			setIsSidebarOpen(false);
		}

		navigate(`/chat/${groupChatRoom.id}`);
	};

	const hasMessage = groupChatRoom.messages!.length > 0 ? true : false;

	let isToday = true;

	if (hasMessage) {
		const gap = new Date().getTime() - new Date(groupChatRoom.messages![0].createdAt).getTime();
		// 86400000 = 24 hours
		isToday = gap < 86400000;
	}

	return (
		<tr
			className={`hover:cursor-pointer ${chatId === groupChatRoom.id ? 'active' : ''} w-full`}
			onClick={clickHandler}
			data-cy="chatRoom"
		>
			<th className="w-full rounded-lg border-none p-3 shadow-inherit transition duration-300 hover:bg-gray-100">
				<div className="flex w-full items-center justify-start gap-x-3">
					<div className="indicator">
						<span
							className={`badge-primary badge badge-xs indicator-item right-1 top-1 ${
								isNewMessage ? 'block' : 'hidden'
							}`}
						></span>
						{groupChatRoom.icon ? (
							<div className="avatar">
								<div className="w-10 rounded-full border">
									<img src={groupChatRoom.icon} alt={groupChatRoom.name} />
								</div>
							</div>
						) : (
							<>
								<div className="placeholder avatar">
									<div className="bg-neutral-focus text-neutral-content w-10 rounded-full border">
										<span>{groupChatRoom.name!.charAt(0).toUpperCase()}</span>
									</div>
								</div>
							</>
						)}
					</div>
					<div className="flex w-full flex-col">
						<span className="flex w-full items-center justify-between font-semibold">
							<span>{groupChatRoom.name}</span>
							<span>
								<time className="ml-2 text-xs opacity-50">
									{!hasMessage ? (
										''
									) : (
										<>
											{isToday && hasMessage ? (
												<>{format(new Date(groupChatRoom.messages![0].createdAt), 'p')}</>
											) : (
												<>{format(new Date(groupChatRoom.messages![0].createdAt), 'MM/dd')}</>
											)}
										</>
									)}
								</time>
							</span>
						</span>
						<div className="max-w-[210px] overflow-x-hidden text-ellipsis text-sm font-normal">
							{hasMessage && (
								<span>
									{groupChatRoom.messages![0].sender.username}: {groupChatRoom.messages![0].text || 'image'}
								</span>
							)}
						</div>
					</div>
				</div>
			</th>
		</tr>
	);
};

export default memo(GroupChatRoom);
