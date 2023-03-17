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
	const { roomName } = useParams();

	const navigate = useNavigate();

	const { currentUser, setCurrentUser } = useUser();
	const currentUserName = currentUser?.username;
	const currentUserChats = currentUser?.chats;

	const [message, setMessage] = useState<string>('');
	const [isOpenMemberList, setIsOpenMemberList] = useState<boolean>(true);

	useEffect(() => {
		if (socket) {
			socket.emit('join_room', {
				roomName,
				username: currentUserName,
			});

			return () => {
				socket.emit('move_room', { roomName });
			};
		}
	}, [roomName, currentUserName, socket]);

	//Add new chat room on the side bar.
	useEffect(() => {
		const addChatroom = async () => {
			const { data } = await axios.get('http://localhost:8080/chat', {
				params: { roomName },
				withCredentials: true,
			});

			setCurrentUser((prev) => ({
				...prev!,
				chats: [...currentUserChats!, { name: data.name, id: data.id }],
			}));
		};

		if (!currentUserChats?.map((chat) => chat.name).includes(roomName as string)) {
			addChatroom();
		}
	}, [currentUserChats, roomName, setCurrentUser]);

	const sendMessage = () => {
		socket.emit('send_message', {
			senderId: currentUser!.id,
			roomName,
			senderName: currentUserName,
			text: message,
		});

		setMessage('');
	};

	const leaveChat = () => {
		const result = window.confirm('Are you sure you want to leave the chat?');

		if (result) {
			socket.emit('leave_room', { roomName, username: currentUserName });

			setCurrentUser({
				...currentUser!,
				chats: currentUser!.chats?.filter((chat) => chat.name !== roomName),
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
