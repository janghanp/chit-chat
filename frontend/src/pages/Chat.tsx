import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import produce from 'immer';

import MemberList from '../components/MemberList';
import ChatBody from '../components/ChatBody';
import MessageInputBox from '../components/MessageInputBox';
import { socket } from '../socket';
import useUser from '../hooks/useUser';
import useChat from '../hooks/useChat';
import useFriends from '../hooks/useFriends';
import { Chat as ChatType } from '../types';
import ChatHeader from '../components/ChatHeader';
import { createPortal } from 'react-dom';

const Chat = () => {
	const { chatId } = useParams();
	const queryClient = useQueryClient();
	const { data: currentUser } = useUser();
	const { isLoading, isError, data: currentChat, isSuccess } = useChat(chatId as string, currentUser!.id);
	useFriends();
	const [isOpenMemberList, setIsOpenMemberList] = useState<boolean>(false);

	useEffect(() => {
		if (currentChat) {
			socket.emit('join_chat', {
				chatId,
				currentUser,
				isNewMember: currentChat.isNewMember,
			});

			if (currentChat.isNewMember) {
				queryClient.setQueryData<ChatType>(['chat', chatId], (old) => {
					if (old) {
						return { ...old, isNewMember: false };
					}
				});
			}
		}
	}, [currentChat, chatId, currentUser, queryClient]);

	//Add the chat that the current user has just joined to, if the user has no the group chat room on the sidebar.
	useEffect(() => {
		if (currentChat && isSuccess) {
			if (currentChat.chat.type === 'GROUP') {
				queryClient.setQueryData<ChatType[]>(['groupChatRooms'], (old) => {
					if (old) {
						return produce(old, (draftState) => {
							if (!old.map((el: ChatType) => el.id).includes(currentChat.chat.id)) {
								draftState.push({ ...currentChat.chat, messages: currentChat.chat.messages });
							}
						});
					}
				});
			} else {
				queryClient.setQueryData<ChatType[]>(['privateChatRooms'], (old) => {
					if (old) {
						return produce(old, (draftState) => {
							if (!old.map((el: ChatType) => el.id).includes(currentChat.chat.id)) {
								draftState.push({ ...currentChat.chat, messages: currentChat.chat.messages });
							}
						});
					}
				});
			}
		}
	}, [currentChat, isSuccess, queryClient]);

	if (isLoading) {
		return <div></div>;
	}

	if (isError) {
		return <div>Error...</div>;
	}

	if (!currentChat) {
		return <div>No currentChat...</div>;
	}

	return (
		<div className="bg-base-100 flex h-full w-full flex-col justify-between gap-y-3 rounded-md p-3">
			<ChatHeader
				chatId={currentChat.chat.id}
				isOwner={currentUser!.id === currentChat.chat.ownerId}
				currentChatName={
					currentChat.chat.type === 'GROUP' ? currentChat.chat.name : currentChat.chat.users![0].username
				}
				setIsOpenMemberList={setIsOpenMemberList}
			/>
			<div className="relative flex-1 overflow-y-auto rounded-md border bg-gray-100/50 p-3 shadow-md">
				<ChatBody />
			</div>
			<MessageInputBox currentChat={currentChat} currentUser={currentUser!} />
			{createPortal(
				<MemberList
					isOpenMemberList={isOpenMemberList}
					setIsOpenMemberList={setIsOpenMemberList}
					chatId={chatId as string}
					chatOwnerId={currentChat.chat.ownerId}
				/>,
				document.getElementById('chat-member-list')!
			)}
		</div>
	);
};

export default Chat;
