import { useState } from 'react';

import { User } from '../types';
import defaultAvatar from '/default.jpg';
import useUser from '../hooks/useUser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createChat } from '../api/chat';
import { useNavigate, useParams } from 'react-router-dom';
import { socket } from '../socket';
import axios from 'axios';

interface Props {
	member: User;
}

const Member = ({ member }: Props) => {
	const navigate = useNavigate();

	const queryClient = useQueryClient();

	const { data: currentUser } = useUser();

	const { mutate } = useMutation({
		mutationFn: (formData: FormData) => {
			return createChat(formData);
		},
		onSuccess: (data) => {
			queryClient.setQueryData(['chatRooms'], (old: any) => {
				return [...old, data];
			});

			socket.emit('private', {
				receiverId: member.id,
				chatId: data.id,
			});

			navigate(`/chat/${data.id}`);
		},
		onError: (error: any) => {
			console.log(error);
		},
	});

	const [isOpen, setIsOpen] = useState<boolean>(false);

	const createPrivateChatHandler = async () => {
		const formData = new FormData();

		formData.append('receiverId', member.id);

		// Check if there is already a private chat between users.
		const { data } = await axios.get('/chat/private', {
			params: {
				senderId: currentUser!.id,
				receiverId: member.id,
			},
			withCredentials: true,
		});

		if (data) {
			navigate(`/chat/${data.id}`);
			return;
		}

		mutate(formData);
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
					</ul>

					<div onClick={() => setIsOpen(false)} className="fixed inset-0"></div>
				</>
			)}
		</div>
	);
};

export default Member;
