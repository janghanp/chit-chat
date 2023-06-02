import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dispatch, SetStateAction, useState } from 'react';
import { HiOutlineTrash, HiOutlineArrowCircleRight } from 'react-icons/hi';
import { HiOutlineWrenchScrewdriver, HiOutlineEnvelope } from 'react-icons/hi2';

import { deleteChat, leaveChat } from '../api/chat';
import { socket } from '../socket';
import { useNavigate } from 'react-router';
import useUser from '../hooks/useUser';
import ChatSettings from './ChatSettings';
import { Chat } from '../types';
import InviteFriends from './InviteFriends';

interface Props {
	isDropDownOpen: boolean;
	setIsDropDownOpen: Dispatch<SetStateAction<boolean>>;
	isOwner: boolean;
	chatId: string;
}

const Dropdown = ({ isDropDownOpen, setIsDropDownOpen, isOwner, chatId }: Props) => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { data: currentUser } = useUser();
	const [isSettingOpen, setIsSettingOpen] = useState<boolean>(false);
	const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);
	const { mutate: leaveChatMutate } = useMutation({
		mutationKey: ['leaveChat', chatId],
		mutationFn: ({ chatId, userId }: { chatId: string; userId: string }) => {
			return leaveChat(chatId, userId);
		},
		onSuccess: () => {
			queryClient.setQueryData<Chat[]>(['groupChatRooms'], (old) => {
				if (old) {
					return old.filter((el) => el.id !== chatId);
				}
			});

			queryClient.setQueryData<Chat[]>(['privateChatRooms'], (old) => {
				if (old) {
					return old.filter((el) => el.id !== chatId);
				}
			});

			queryClient.removeQueries({ queryKey: ['chat', chatId], exact: true });
			queryClient.removeQueries({ queryKey: ['members', chatId], exact: true });
			queryClient.removeQueries({ queryKey: ['messages', chatId], exact: true });

			socket.emit('leave_chat', { chatId, userId: currentUser?.id });

			navigate('/');
		},
		onError(error) {
			console.log(error);
		},
	});
	const { mutate: deleteChatMutate } = useMutation({
		mutationKey: ['deleteChat', chatId],
		mutationFn: ({ chatId }: { chatId: string }) => {
			return deleteChat(chatId);
		},
		onSuccess: () => {
			queryClient.setQueriesData<Chat[]>(['groupChatRooms', currentUser!.id], (old) => {
				if (old) {
					return old.filter((el) => el.id !== chatId);
				}
			});

			queryClient.setQueriesData<Chat[]>(['privateChatRooms', currentUser!.id], (old) => {
				if (old) {
					return old.filter((el) => el.id !== chatId);
				}
			});

			socket.emit('delete_chat', { chatId });

			navigate('/');
		},
		onError(error) {
			console.log(error);
		},
	});

	const leaveChatHandler = async () => {
		const result = window.confirm('Are you sure you want to leave the chat?');

		if (result) {
			leaveChatMutate({ userId: currentUser!.id, chatId });
		}
	};

	const deleteChatHandler = async () => {
		const result = window.confirm('Are you sure you want to delete the chat?');

		if (result) {
			deleteChatMutate({ chatId });
		}
	};

	return (
		<>
			<div className="absolute right-0 top-10">
				{isDropDownOpen && (
					<>
						<ul
							data-cy="dropdown-menu"
							className="menu menu-compact bg-base-100 absolute right-0 z-30 w-52 rounded-md border p-2 shadow-md"
						>
							{isOwner && (
								<>
									<li
										onClick={() => {
											setIsDropDownOpen(false);
											setIsInviteOpen(true);
										}}
									>
										<div className="flex w-full items-center justify-between">
											<span>Invite friends</span>
											<HiOutlineEnvelope />
										</div>
									</li>
									<li
										onClick={() => {
											setIsDropDownOpen(false);
											setIsSettingOpen(true);
										}}
									>
										<div className="flex w-full items-center justify-between">
											<span>Settings</span>
											<HiOutlineWrenchScrewdriver />
										</div>
									</li>
								</>
							)}
							<li onClick={isOwner ? deleteChatHandler : leaveChatHandler}>
								{isOwner ? (
									<div className="text-error flex items-center justify-between">
										<span>Delete Chat</span>
										<HiOutlineTrash />
									</div>
								) : (
									<div className="text-error flex items-center justify-between">
										<span>Leave Chat</span>
										<HiOutlineArrowCircleRight />
									</div>
								)}
							</li>
						</ul>
						<div className="fixed inset-0 z-20" onClick={() => setIsDropDownOpen(false)}></div>
					</>
				)}
			</div>

			{isOwner && isSettingOpen && (
				<ChatSettings chatId={chatId} currentUserId={currentUser!.id} setIsSettingOpen={setIsSettingOpen} />
			)}

			{isOwner && isInviteOpen && <InviteFriends chatId={chatId} setIsInviteOpen={setIsInviteOpen} />}
		</>
	);
};

export default Dropdown;
