import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import produce from 'immer';

import MemberList from '../components/MemberList';
import ChatBody from '../components/ChatBody';
import Header from '../components/Header';
import MessageInputBox from '../components/MessageInputBox';
import { socket } from '../socket';
import useUser from '../hooks/useUser';
import useChat from '../hooks/useChat';
import useFriends from '../hooks/useFriends';
import { Chat as ChatType } from '../types';

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

	useEffect(() => {
		if (currentChat && isSuccess) {
			queryClient.setQueryData<ChatType[]>(['chatRooms'], (old) => {
				if (old) {
					return produce(old, (draftState) => {
						if (!old.map((el: any) => el.id).includes(currentChat.chat.id)) {
							draftState.push({ ...currentChat.chat, messages: currentChat.chat.messages });
						}
					});
				}
			});
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
		<div className={`fixed left-0 sm:left-80 ${isOpenMemberList ? 'right-56' : 'right-0'}  top-10 bottom-0`}>
			<Header
				chatId={currentChat.chat.id}
				isOwner={currentUser!.id === currentChat.chat.ownerId}
				currentChatName={currentChat.chat.name}
				setIsOpenMemberList={setIsOpenMemberList}
			/>
			<ChatBody />
			<MessageInputBox currentChat={currentChat} currentUser={currentUser!} />
			<MemberList
				isOpenMemberList={isOpenMemberList}
				chatId={chatId as string}
				chatOwnerId={currentChat.chat.ownerId}
			/>
		</div>
	);
};

export default Chat;
