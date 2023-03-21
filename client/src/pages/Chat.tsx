import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import { Message, User } from '../types';
import { useUser } from '../context/UserContext';
import MemberList from '../components/MemberList';
import axios from 'axios';
import ChatBody from '../components/ChatBody';
import Header from '../components/Header';

interface Props {
	socket: Socket;
	members: User[];
	messages: Message[];
	isLoading: boolean;
	setMembers: Dispatch<SetStateAction<User[]>>;
	setMessages: Dispatch<SetStateAction<Message[]>>;
}

const Chat = ({ socket, members, messages, isLoading, setMessages, setMembers }: Props) => {
	const { chatId } = useParams();

	const navigate = useNavigate();

	const { currentUser, setCurrentUser } = useUser();

	const [owenerId, setOwnerId] = useState<string>();
	const [chatName, setChatName] = useState<string>();
	const [message, setMessage] = useState<string>('');
	const [isOpenMemberList, setIsOpenMemberList] = useState<boolean>(true);

	const isSetRef = useRef<boolean>(false);

	const isOwner = currentUser?.id === owenerId;

	useEffect(() => {
		const joinChat = async () => {
			const { data } = await axios.patch(
				'http://localhost:8080/chat/join',
				{ chatId, username: currentUser?.username },
				{ withCredentials: true }
			);

			const { isNewMember, chat } = data;

			setMessages(chat.messages);
			setMembers(chat.users);
			setOwnerId(chat.owner.id);
			setChatName(chat.name);

			socket.emit('join_chat', {
				chatId,
				currentUser,
				isNewMember,
			});

			if (isNewMember) {
				//Add a chat on the sidebar.
				setCurrentUser((prev) => ({
					...prev!,
					chats: [
						...prev?.chats!,
						{ name: chat.name, id: chat.id, icon: chat.icon, public_id: chat.public_id, ownerId: chat.ownerId },
					],
				}));
			}
		};

		if (socket && !isSetRef.current) {
			isSetRef.current = true;

			joinChat();
		}

		return () => {
			if (socket) {
				isSetRef.current = false;
			}
		};
	}, [chatId, socket]);

	const sendMessage = async () => {
		if (!message) {
			return;
		}

		const { data } = await axios.post(
			'http://localhost:8080/chat/message',
			{
				chatId,
				text: message,
				senderId: currentUser?.id,
			},
			{ withCredentials: true }
		);

		socket.emit('send_message', {
			messageId: data.message.id,
			text: message,
			sender: currentUser,
			chatId,
			createdAt: data.message.createdAt,
		});

		setMessage('');
	};

	const leaveChat = async () => {
		const result = window.confirm('Are you sure you want to leave the chat?');

		if (result) {
			await axios.patch(
				'http://localhost:8080/chat/leave',
				{ chatId, username: currentUser?.username },
				{ withCredentials: true }
			);

			socket.emit('leave_chat', { chatId, username: currentUser?.username });

			setCurrentUser({
				...currentUser!,
				chats: currentUser!.chats?.filter((chat) => chat.id !== chatId),
			});

			navigate('/');
		}
	};

	const deleteChat = async () => {
		const result = window.confirm('Are you sure you want to delete the chat?');

		if (result) {
			await axios.delete(`http://localhost:8080/chat/${chatId}`, { withCredentials: true });

			navigate('/');
		}
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className={`fixed left-0 sm:left-80 ${isOpenMemberList ? 'right-56' : 'right-0'}  top-10 bottom-0`}>
			<Header
				chatName={chatName as string}
				setIsOpenMemberList={setIsOpenMemberList}
				leavChat={leaveChat}
				deleteChat={deleteChat}
				isOwner={isOwner}
			/>
			<ChatBody messages={messages} />
			<div className="absolute bottom-0 left-[2px] w-full bg-base-100 p-3">
				<div className="flex gap-x-2">
					<input
						className="input-bordered input w-full"
						type="text"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
					/>
					<button className="btn" disabled={!message} onClick={sendMessage}>
						Send
					</button>
				</div>
			</div>
			{isOpenMemberList && owenerId && <MemberList ownerId={owenerId} members={members} />}
		</div>
	);
};

export default Chat;
