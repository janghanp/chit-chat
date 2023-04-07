import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dispatch, SetStateAction, useState } from 'react';
import { HiOutlineChevronDown, HiOutlineX, HiOutlineTrash, HiOutlineArrowCircleRight } from 'react-icons/hi';
import { HiOutlineWrenchScrewdriver } from 'react-icons/hi2';

import { deleteChat, leaveChat } from '../api/chat';
import { socket } from '../socket';
import { useNavigate } from 'react-router';
import useUser from '../hooks/useUser';
import ChatSettings from './ChatSettings';
import { Chat } from '../types';

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
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const { mutate: leaveChatMutate } = useMutation({
		mutationKey: ['leaveChat', chatId],
		mutationFn: ({ chatId, userId }: { chatId: string; userId: string }) => {
			return leaveChat(chatId, userId);
		},
		onSuccess: () => {
			queryClient.setQueryData<Chat[]>(['chatRooms'], (old) => {
				if (old) {
					return old.filter((el: any) => el.id !== chatId);
				}
			});
			queryClient.removeQueries({ queryKey: ['chat', chatId], exact: true });
			queryClient.removeQueries({ queryKey: ['members', chatId], exact: true });
			queryClient.removeQueries({ queryKey: ['messages', chatId], exact: true });

			socket.emit('leave_chat', { chatId, userId: currentUser?.id });

			navigate('/');
		},
		onError() {},
	});
	const { mutate: deleteChatMutate } = useMutation({
		mutationKey: ['deleteChat', chatId],
		mutationFn: ({ chatId }: { chatId: string }) => {
			return deleteChat(chatId);
		},
		onSuccess: () => {
			queryClient.setQueriesData<Chat[]>(['chatRooms', currentUser!.id], (old) => {
				if (old) {
					return old.filter((el: any) => el.id !== chatId);
				}
			});

			socket.emit('delete_chat', { chatId });

			navigate('/');
		},
		onError() {},
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
			<div className="absolute right-5">
				<label className="swap-rotate swap z-30">
					<input type="checkbox" />
					<HiOutlineChevronDown className="swap-off z-20 h-5 w-5" onClick={() => setIsDropDownOpen((prev) => !prev)} />
					<HiOutlineX className="swap-on z-20 h-5 w-5" onClick={() => setIsDropDownOpen((prev) => !prev)} />
					{isDropDownOpen && (
						<div className="fixed inset-0 z-10 cursor-default" onClick={() => setIsDropDownOpen((prev) => !prev)}></div>
					)}
				</label>
				{isDropDownOpen && (
					<ul className="menu rounded-box menu-compact absolute right-0 z-30 w-52 border bg-base-100 p-2 shadow-md">
						{isOwner && (
							<li
								onClick={() => {
									setIsDropDownOpen(false);
									setIsOpen(true);
								}}
							>
								<div className="flex w-full items-center justify-between">
									<span>Settings</span>
									<HiOutlineWrenchScrewdriver />
								</div>
							</li>
						)}
						<li onClick={isOwner ? deleteChatHandler : leaveChatHandler}>
							{isOwner ? (
								<div className="flex items-center justify-between text-error">
									<span>Delete Chat</span>
									<HiOutlineTrash />
								</div>
							) : (
								<div className="flex items-center justify-between text-error">
									<span>Leave Chat</span>
									<HiOutlineArrowCircleRight />
								</div>
							)}
						</li>
					</ul>
				)}
			</div>
			{isOwner && isOpen && <ChatSettings chatId={chatId} currentUserId={currentUser!.id} setIsOpen={setIsOpen} />}
		</>
	);
};

export default Dropdown;
