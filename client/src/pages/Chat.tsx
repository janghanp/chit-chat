import { useEffect, useState } from 'react';
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
}

const Chat = ({ socket, members, messages, isLoading }: Props) => {
	const { chatId } = useParams();

	const navigate = useNavigate();

	const { currentUser, setCurrentUser } = useUser();
	const currentUserName = currentUser?.username;
	const currentUserChats = currentUser?.chats;

	const [message, setMessage] = useState<string>('');
	const [isOpenMemberList, setIsOpenMemberList] = useState<boolean>(true);

	useEffect(() => {
		if (socket) {
			socket.emit('join_room', {
				chatId,
				username: currentUserName,
			});

			return () => {
				socket.emit('move_room', { chatId });
			};
		}
	}, [chatId, currentUserName, socket]);

	useEffect(() => {
		const addChatroom = async () => {
			try {
				const { data } = await axios.get('http://localhost:8080/chat', {
					params: { chatId },
					withCredentials: true,
				});

				setCurrentUser((prev) => ({
					...prev!,
					chats: [
						...currentUserChats!,
						{ name: data.name, id: data.id, icon: data.icon, public_id: data.public_id, ownerId: data.ownerId },
					],
				}));
			} catch (error) {
				if (axios.isAxiosError(error)) {
					// Enter a chatroom that doesn't exist
					if (error.response?.status === 400) {
						navigate('/');
						return;
					}
				}
			}
		};

		if (!currentUserChats?.map((chat) => chat.id).includes(chatId as string)) {
			//Add a chatroom when entering the room for the first time.
			addChatroom();
		}
	}, [currentUserChats, chatId, setCurrentUser, navigate]);

	const sendMessage = () => {
		socket.emit('send_message', {
			senderId: currentUser!.id,
			chatId,
			senderName: currentUserName,
			text: message,
		});

		setMessage('');
	};

	const leaveChat = () => {
		const result = window.confirm('Are you sure you want to leave the chat?');

		if (result) {
			socket.emit('leave_room', { chatId, username: currentUserName });

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
								<p>{msg.senderName}</p>
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
