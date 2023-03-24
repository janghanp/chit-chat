import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dispatch, SetStateAction } from 'react';
import { HiOutlineChevronDown, HiOutlineX } from 'react-icons/hi';

import { deleteChatt, updateChat } from '../api/chat';
import { useCurrentUserStore } from '../store';
import { socket } from '../socket';
import { useNavigate } from 'react-router';

interface Props {
	isDropDownOpen: boolean;
	setIsDropDownOpen: Dispatch<SetStateAction<boolean>>;
	isOwner: boolean;
	chatId: string;
}

const Dropdown = ({ isDropDownOpen, setIsDropDownOpen, isOwner, chatId }: Props) => {
	const queryClient = useQueryClient();

	const navigate = useNavigate();

	const currentUser = useCurrentUserStore((state) => state.currentUser);

	const { mutate: updateMutate } = useMutation({
		mutationKey: ['leaveChat', chatId],
		mutationFn: () => {
			return updateChat(chatId!, currentUser!.id);
		},
		onSuccess: () => {
			queryClient.setQueryData(['chatRooms', currentUser!.id], (old: any) => {
				const newRooms = old.chats.filter((el: any) => el.id !== chatId);

				return { ...old, chats: newRooms };
			});

			queryClient.removeQueries(['chat', chatId], { exact: true });

			socket.emit('leave_chat', { chatId, userId: currentUser?.id });

			navigate('/');
		},
		onError() {},
	});

	const { mutate: deleteMutate } = useMutation({
		mutationKey: ['deleteChat', chatId],
		mutationFn: () => {
			return deleteChatt(chatId!);
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

	const leaveChat = async () => {
		const result = window.confirm('Are you sure you want to leave the chat?');

		if (result) {
			updateMutate();
		}
	};

	const deleteChat = async () => {
		const result = window.confirm('Are you sure you want to delete the chat?');

		if (result) {
			deleteMutate();
		}
	};

	return (
		<div className="absolute right-5">
			<label className="swap swap-rotate z-30">
				<input type="checkbox" />
				<HiOutlineChevronDown className="swap-off z-20 h-5 w-5" onClick={() => setIsDropDownOpen((prev) => !prev)} />
				<HiOutlineX className="swap-on z-20 h-5 w-5" onClick={() => setIsDropDownOpen((prev) => !prev)} />
				{isDropDownOpen && (
					<div className="fixed inset-0 z-10 cursor-default" onClick={() => setIsDropDownOpen((prev) => !prev)}></div>
				)}
			</label>
			{/* overlay */}
			{isDropDownOpen && (
				<>
					<ul className="menu rounded-box absolute right-0 z-30 w-52 border bg-base-100 p-2 shadow-md">
						<li onClick={isOwner ? deleteChat : leaveChat}>
							<span className="text-error">{isOwner ? 'Delete Chat' : 'Leave Chat'}</span>
						</li>
					</ul>
				</>
			)}
		</div>
	);
};

export default Dropdown;
