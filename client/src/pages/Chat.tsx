import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { HiUserGroup } from 'react-icons/hi';
import { Socket } from 'socket.io-client';

import { Message, User } from '../types';
import { useUser } from '../context/UserContext';
import MemberList from '../components/MemberList';
import axios from 'axios';

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

	const leaveChat = () => {
		const result = window.confirm('Are you sure you want to leave the chat?');

		if (result) {
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
		<>
			<div className="fixed left-0 top-0 z-20 flex h-10 w-full items-center justify-end bg-base-100 pr-5 shadow-md">
				<div className="tool tooltip tooltip-bottom" data-tip="Show Members">
					<button className="btn-ghost btn-sm btn px-2" onClick={() => setIsOpenMemberList(!isOpenMemberList)}>
						<HiUserGroup className="text-2xl" />
					</button>
				</div>
			</div>

			<div>
				{isOpenMemberList && <MemberList members={members} />}

				<button className="rounded-md border p-2" onClick={leaveChat}>
					Leave
				</button>

				{messages &&
					messages.map((msg) => {
						return (
							<div key={msg.id}>
								<p>{msg.sender.username}</p>
								<p>{msg.text}</p>
								<p>{formatDistance(new Date(msg.createdAt), Date.now(), { addSuffix: true })}</p>
							</div>
						);
					})}

				<input className="border" type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
				<button className="border" onClick={sendMessage}>
					Send
				</button>
			</div>
		</>
	);
};

export default Chat;
