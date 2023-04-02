import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import produce from 'immer';

import MemberList from '../components/MemberList';
import ChatBody from '../components/ChatBody';
import Header from '../components/Header';
import { socket } from '../socket';
import { createMessage } from '../api/message';
import useUser from '../hooks/useUser';
import useChat from '../hooks/useChat';

const Chat = () => {
	const { chatId } = useParams();

	const queryClient = useQueryClient();

	const { data: currentUser } = useUser();

	const { isLoading, isError, data: currentChat, isSuccess } = useChat(chatId as string, currentUser!.id);

	const { mutate } = useMutation({
		mutationKey: ['createMessage', chatId],
		mutationFn: ({
			chatId,
			inputMessage,
			currentUserId,
		}: {
			chatId: string;
			inputMessage: string;
			currentUserId: string;
		}) => {
			return createMessage(chatId, inputMessage, currentUserId);
		},
		onSuccess: (data) => {
			if (currentChat?.chat.ownerId) {
				// Group chat message
				socket.emit('send_message', {
					messageId: data.message.id,
					text: inputMessage,
					sender: currentUser,
					chatId,
					createdAt: data.message.createdAt,
				});
			} else {
				// Private chat message
				socket.emit('private_message', {
					messageId: data.message.id,
					text: inputMessage,
					sender: currentUser,
					chatId,
					createdAt: data.message.createdAt,
				});
			}

			setInputMessage('');
		},
		onError: (error: any) => {
			console.log(error);
		},
	});

	const [inputMessage, setInputMessage] = useState<string>('');
	const [isOpenMemberList, setIsOpenMemberList] = useState<boolean>(true);

	useEffect(() => {
		if (currentChat) {
			socket.emit('join_chat', {
				chatId,
				currentUser,
				isNewMember: currentChat.isNewMember,
			});

			if (currentChat.isNewMember) {
				queryClient.setQueryData(['chat', chatId], (old: any) => {
					return { ...old, isNewMember: false };
				});
			}
		}
	}, [currentChat, chatId]);

	useEffect(() => {
		if (currentChat && isSuccess) {
			if (currentChat.isNewMember) {
				queryClient.setQueryData(['chatRooms'], (old: any) => {
					return produce(old, (draftState: any) => {
						draftState.push({ ...currentChat.chat, messages: currentChat.chat.messages });
					});
				});
			}
		}
	}, [currentChat, isSuccess]);

	const clickHandler = async () => {
		if (!inputMessage) {
			return;
		}

		mutate({ chatId: chatId as string, inputMessage, currentUserId: currentUser!.id });
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (isError) {
		return <div>Error...</div>;
	}

	if (!currentChat) {
		return <div>No currentChat...</div>;
	}

	return (
		<div className={`fixed left-0 sm:left-80 ${isOpenMemberList ? 'right-56' : 'right-0'}  top-10 bottom-0`}>
			<Header
				chatId={currentChat.chat.id}
				isOwner={currentUser!.id === currentChat.chat.ownerId}
				currentChatName={currentChat.chat.name}
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
			<MemberList
				isOpenMemberList={isOpenMemberList}
				chatId={chatId as string}
				chatOwnerId={currentChat.chat.ownerId}
			/>
		</div>
	);
};

export default Chat;
