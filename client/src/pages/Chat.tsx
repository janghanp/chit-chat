import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import produce from 'immer';

import MemberList from '../components/MemberList';
import ChatBody from '../components/ChatBody';
import Header from '../components/Header';
import { socket } from '../socket';
import { useCurrentUserStore } from '../store';
import { fetchChat } from '../api/chat';
import { createMessage } from '../api/message';

const Chat = () => {
	const { chatId } = useParams();

	const queryClient = useQueryClient();

	const currentUser = useCurrentUserStore((state) => state.currentUser);

	const [inputMessage, setInputMessage] = useState<string>('');
	const [isOpenMemberList, setIsOpenMemberList] = useState<boolean>(true);

	const { isLoading, isError, data } = useQuery({
		queryKey: ['chat', chatId],
		queryFn: async () => fetchChat(chatId as string, currentUser!.id),
		onSuccess: (data) => {
			if (data.isNewMember) {
				queryClient.setQueryData(['chatRooms', currentUser!.id], (old: any) => {
					const newOld = produce(old, (draftState: any) => {
						draftState.chats.push({ ...data.chat, messages: [data.chat.messages.pop()] });
					});

					return newOld;
				});
			}
		},
	});

	const { mutate } = useMutation({
		mutationKey: ['createMessage', chatId],
		mutationFn: () => {
			return createMessage(chatId!, inputMessage, currentUser!.id);
		},
		onSuccess: (data) => {
			socket.emit('send_message', {
				messageId: data.message.id,
				text: inputMessage,
				sender: currentUser,
				chatId,
				createdAt: data.message.createdAt,
			});

			setInputMessage('');
		},
		onError: (error: any) => {
			console.log(error);
		},
	});

	useEffect(() => {
		if (data) {
			socket.emit('join_chat', {
				chatId,
				currentUser,
				isNewMember: data.isNewMember,
			});

			if (data.isNewMember) {
				queryClient.setQueryData(['chat', chatId], (old: any) => {
					return { ...old, isNewMember: false };
				});
			}
		}
	}, [data, chatId]);

	const clickHandler = async () => {
		if (!inputMessage) {
			return;
		}

		mutate();
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (isError) {
		return <div>Error...</div>;
	}

	return (
		<div className={`fixed left-0 sm:left-80 ${isOpenMemberList ? 'right-56' : 'right-0'}  top-10 bottom-0`}>
			<Header
				chatId={data.chat.id}
				isOwner={currentUser!.id === data.chat.id}
				currentChatName={data.chat.name}
				setIsOpenMemberList={setIsOpenMemberList}
			/>
			<ChatBody />
			<div className="absolute bottom-0 left-[2px] w-full bg-base-100 p-3">
				<div className="flex gap-x-2">
					<input
						className="input-bordered input w-full"
						type="text"
						value={inputMessage}
						onChange={(e) => setInputMessage(e.target.value)}
					/>
					<button className="btn" disabled={!inputMessage} onClick={clickHandler}>
						Send
					</button>
				</div>
			</div>
			{isOpenMemberList && <MemberList members={data.chat.users} chatOwnerId={data.chat.ownerId} />}
		</div>
	);
};

export default Chat;
