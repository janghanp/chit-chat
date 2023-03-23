import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import MemberList from '../components/MemberList';
import axios from 'axios';
import ChatBody from '../components/ChatBody';
import Header from '../components/Header';
import { socket } from '../socket';
import { useMembersStore, useMessagesStore, useCurrentUserStore, useCurrentChatStore, useChatsStore } from '../store';
import { User } from '../types';

const Chat = () => {
	const { chatId } = useParams();

	const navigate = useNavigate();

	const currentUser = useCurrentUserStore((state) => state.currentUser);
	const setMessages = useMessagesStore((state) => state.setMessages);
	const setMembers = useMembersStore((state) => state.setMembers);
	const setCurrentChat = useCurrentChatStore((state) => state.setCurrentChat);
	const addChat = useChatsStore((state) => state.addChat);
	const removeChat = useChatsStore((state) => state.removeChat);
	const addMember = useMembersStore((state) => state.addMember);
	const removeMember = useMembersStore((state) => state.removeMember);
	const addMessage = useMessagesStore((state) => state.addMessage);
	const updateChat = useChatsStore((state) => state.updateChat);

	const [inputMessage, setInputMessage] = useState<string>('');
	const [isOpenMemberList, setIsOpenMemberList] = useState<boolean>(true);

	useEffect(() => {
		const onReceiveMessage = (data: {
			chatId: string;
			messageId: string;
			text: string;
			sender: User;
			createdAt: string;
		}) => {
			const { chatId: fromChatId, messageId, text, sender, createdAt } = data;
			updateChat(fromChatId, { id: messageId, text, sender, createdAt });
			if (chatId === fromChatId) {
				addMessage({ id: messageId, sender, text, createdAt });
			}
		};

		const onEnterNewMember = (data: { newUser: User; chatId: string }) => {
			const { newUser, chatId: fromChatId } = data;
			newUser.isOnline = true;
			if (chatId === fromChatId) {
				addMember(newUser);
			}
		};

		const onLeaveMember = (data: { userId: string; chatId: string }) => {
			const { userId, chatId: fromChatId } = data;
			if (chatId === fromChatId) {
				removeMember(userId);
			}
		};

		socket.on('receive_message', onReceiveMessage);
		socket.on('enter_new_member', onEnterNewMember);
		socket.on('leave_member', onLeaveMember);

		return () => {
			socket.off('receive_message', onReceiveMessage);
			socket.off('enter_new_member', onEnterNewMember);
			socket.off('leave_member', onLeaveMember);
		};
	}, [chatId]);

	useEffect(() => {
		const joinChat = async () => {
			try {
				const { data } = await axios.patch(
					'http://localhost:8080/chat/join',
					{ chatId, username: currentUser?.username },
					{ withCredentials: true }
				);

				const { isNewMember, chat } = data;

				if (isNewMember) {
					let messages: any[] = [];

					if (chat.messages && chat.messages[0] && chat.messages[0].text) {
						messages = [chat.messages.pop()];
					} else {
						messages = [];
					}

					//Add a chat on the sidebar.
					addChat({
						name: chat.name,
						id: chat.id,
						icon: chat.icon,
						public_id: chat.public_id,
						ownerId: chat.ownerId,
						messages,
					});
				}

				setMessages(chat.messages);
				setMembers(chat.users);
				delete chat.messages;
				delete chat.users;
				setCurrentChat(data.chat);

				socket.emit('join_chat', {
					chatId,
					currentUser,
					isNewMember,
				});
			} catch (error) {
				console.log(error);

				navigate('/');
			}
		};

		joinChat();
	}, [chatId]);

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

	const leaveChat = async () => {
		const result = window.confirm('Are you sure you want to leave the chat?');

		if (result) {
			await axios.patch(
				'http://localhost:8080/chat/leave',
				{ chatId, username: currentUser?.username },
				{ withCredentials: true }
			);

			socket.emit('leave_chat', { chatId, userId: currentUser?.id });

			removeChat(chatId as string);

			navigate('/');
		}
	};

	const deleteChat = async () => {
		const result = window.confirm('Are you sure you want to delete the chat?');

		if (result) {
			await axios.delete(`http://localhost:8080/chat/${chatId}`, { withCredentials: true });

			socket.emit('delete_chat', { chatId });

			navigate('/');
		}
	};
	console.log('Chat.tsx render');

	return (
		<div className={`fixed left-0 sm:left-80 ${isOpenMemberList ? 'right-56' : 'right-0'}  top-10 bottom-0`}>
			<Header leavChat={leaveChat} deleteChat={deleteChat} setIsOpenMemberList={setIsOpenMemberList} />
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
			{isOpenMemberList && <MemberList />}
		</div>
	);
};

export default Chat;
