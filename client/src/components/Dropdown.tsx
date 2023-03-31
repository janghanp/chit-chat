import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dispatch, SetStateAction, useState } from 'react';
import { HiOutlineChevronDown, HiOutlineX, HiOutlineTrash, HiOutlineArrowCircleRight } from 'react-icons/hi';
import { HiOutlineWrenchScrewdriver } from 'react-icons/hi2';

import { deleteChat, leaveChat } from '../api/chat';
import { socket } from '../socket';
import { useNavigate } from 'react-router';
import useUser from '../hooks/useUser';
import ChatSettings from './ChatSettings';

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

	const { mutate: updateMutate } = useMutation({
		mutationKey: ['leaveChat', chatId],
		mutationFn: () => {
			return leaveChat(chatId!, currentUser!.id);
		},
		onSuccess: () => {
			queryClient.setQueryData(['chatRooms'], (old: any) => {
				return old.filter((el: any) => el.id !== chatId);
			});

			queryClient.removeQueries({ queryKey: ['chat', chatId], exact: true });
			queryClient.removeQueries({ queryKey: ['members', chatId], exact: true });
			queryClient.removeQueries({ queryKey: ['messages', chatId], exact: true });

			socket.emit('leave_chat', { chatId, userId: currentUser?.id });

			navigate('/');
		},
		onError() {},
	});

	const { mutate: deleteMutate } = useMutation({
		mutationKey: ['deleteChat', chatId],
		mutationFn: () => {
			return deleteChat(chatId!);
		},
		onSuccess: () => {
			queryClient.setQueriesData(['chatRooms', currentUser!.id], (old: any) => {
				const newRooms = old.chats.filter((el: any) => el.id !== chatId);

				return { ...old, chats: newRooms };
			});

			socket.emit('delete_chat', { chatId });

			navigate('/');
		},
		onError() {},
	});

	const [isOpen, setIsOpen] = useState<boolean>(false);

	const leaveChatHandler = async () => {
		const result = window.confirm('Are you sure you want to leave the chat?');

		if (result) {
			updateMutate();
		}
	};

	const deleteChatHandler = async () => {
		const result = window.confirm('Are you sure you want to delete the chat?');

		if (result) {
			deleteMutate();
		}
	};

	console.log('dropdown.tsx');

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
							<li onClick={() => setIsOpen(true)}>
								<label htmlFor="modal-3" className="flex w-full items-center justify-between">
									<span>Settings</span>
									<HiOutlineWrenchScrewdriver />
								</label>
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
			{isOwner && isOpen && <ChatSettings chatId={chatId} currentUserId={currentUser!.id} />}
		</>
	);
};

export default Dropdown;
