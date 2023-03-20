import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiUserGroup } from 'react-icons/hi';
import { Socket } from 'socket.io-client';

import { Message, User } from '../types';
import { useUser } from '../context/UserContext';
import MemberList from '../components/MemberList';
import axios from 'axios';
import ChatBody from '../components/ChatBody';

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
	const [message, setMessage] = useState<string>('');
	const [isOpenMemberList, setIsOpenMemberList] = useState<boolean>(true);

	const isSetRef = useRef<boolean>(false);

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

			socket.emit('join_room', {
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
				socket.emit('move_room', { chatId });
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

			socket.emit('leave_room', { chatId, username: currentUser?.username });

			setCurrentUser({
				...currentUser!,
				chats: currentUser!.chats?.filter((chat) => chat.id !== chatId),
			});

			navigate('/');
		}
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className={`fixed left-0 sm:left-80 ${isOpenMemberList ? 'right-56' : 'right-0'}  top-10 bottom-0`}>
			{/* header */}
			<div className="fixed left-0 top-0 z-[22]  flex h-10 w-full items-center justify-end bg-base-100 pr-5 shadow-md">
				<div className="tool tooltip tooltip-bottom" data-tip="Show Members">
					<button className="btn-ghost btn-sm btn px-2" onClick={() => setIsOpenMemberList(!isOpenMemberList)}>
						<HiUserGroup className="text-2xl" />
					</button>
				</div>
			</div>

			{isOpenMemberList && owenerId && <MemberList ownerId={owenerId} members={members} />}

			{/* <button className="rounded-md border p-2" onClick={leaveChat}>
					Leave
				</button> */}

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
		</div>
	);
};

export default Chat;
