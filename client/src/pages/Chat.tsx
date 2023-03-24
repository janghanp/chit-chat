import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import MemberList from '../components/MemberList';
import ChatBody from '../components/ChatBody';
import Header from '../components/Header';
import { socket } from '../socket';
import { useCurrentUserStore } from '../store';
import { fetchChat } from '../api/chat';

const Chat = () => {
	const { chatId } = useParams();

	const currentUser = useCurrentUserStore((state) => state.currentUser);

	const [inputMessage, setInputMessage] = useState<string>('');
	const [isOpenMemberList, setIsOpenMemberList] = useState<boolean>(true);

	const { isLoading, isError, data } = useQuery({
		queryKey: ['chat', chatId],
		queryFn: async () => fetchChat(chatId as string, currentUser!.id),
		// 1 min
		staleTime: 1000 * 60,
	});

	useEffect(() => {
		if (data) {
			socket.emit('join_chat', {
				chatId,
				currentUser,
				isNewMember: data.isNewMember,
			});
		}
	}, [data]);

	//TODO: How to manage for a user who enters a chat for the first time.
	// useEffect(() => {
	// 	const joinChat = async () => {
	// 		try {
	// 			const { data } = await axios.get('http://localhost:8080/chat/join', {
	// 				params: {
	// 					chatId,
	// 					username: currentUser?.username,
	// 				},
	// 				withCredentials: true,
	// 			});

	// 			const { isNewMember, chat } = data;

	// 			if (isNewMember) {
	// 				let messages: any[] = [];

	// 				if (chat.messages && chat.messages[0] && chat.messages[0].text) {
	// 					messages = [chat.messages.pop()];
	// 				} else {
	// 					messages = [];
	// 				}

	// 				//Add a chat on the sidebar.
	// 				addChat({
	// 					name: chat.name,
	// 					id: chat.id,
	// 					icon: chat.icon,
	// 					public_id: chat.public_id,
	// 					ownerId: chat.ownerId,
	// 					messages,
	// 				});
	// 			}

	// 			setMessages(chat.messages);
	// 			setMembers(chat.users);
	// 			delete chat.messages;
	// 			delete chat.users;

	// 			socket.emit('join_chat', {
	// 				chatId,
	// 				currentUser,
	// 				isNewMember,
	// 			});
	// 		} catch (error) {
	// 			console.log(error);

	// 			navigate('/');
	// 		}
	// 	};

	// 	joinChat();
	// }, [chatId]);

	//TODO: react-query
	const sendMessage = async () => {
		if (!inputMessage) {
			return;
		}

		const { data } = await axios.post(
			'http://localhost:8080/chat/message',
			{
				chatId,
				text: inputMessage,
				senderId: currentUser?.id,
			},
			{ withCredentials: true }
		);

		socket.emit('send_message', {
			messageId: data.message.id,
			text: inputMessage,
			sender: currentUser,
			chatId,
			createdAt: data.message.createdAt,
		});

		setInputMessage('');
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
					<button className="btn" disabled={!inputMessage} onClick={sendMessage}>
						Send
					</button>
				</div>
			</div>
			{isOpenMemberList && <MemberList members={data.chat.users} chatOwnerId={data.chat.ownerId} />}
		</div>
	);
};

export default Chat;
