import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { HiUserGroup } from 'react-icons/hi';
import { Socket } from 'socket.io-client';

import { Message, User } from '../types';
import { useUser } from '../context/UserContext';
import MemberList from '../components/MemberList';
import { connectSocket } from '../socket';

let socket: Socket;

const Chat = () => {
	const params = useParams();

	const { currentUser, setCurrentUser } = useUser();

	const navigate = useNavigate();

	const [message, setMessage] = useState<string>('');
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [members, setMembers] = useState<User[]>([]);
	const [isOpenMemberList, setIsOpenMemberList] = useState<boolean>(true);

	useEffect(() => {
		const onReceiveMessage = (data: Message) => {
			const { id, senderId, senderName, text, createdAt } = data;

			setMessages((prev) => [...prev, { id, senderId, senderName, text, createdAt }]);
		};

		const onEnterNewMember = (data: { newUser: User }) => {
			setMembers((prev) => {
				return [...prev, data.newUser];
			});
		};

		const onLeaveMember = (data: { username: string }) => {
			setMembers((prev) => {
				return prev.filter((member) => {
					return member.username !== data.username;
				});
			});
		};

		const onOnline = (data: { username: string }) => {
			setMembers((prev) => {
				return prev.map((member) => {
					if (member.username === data.username) {
						member.isOnline = true;
					}

					return member;
				});
			});
		};

		const onOffline = (data: { username: string }) => {
			setMembers((prev) => {
				return prev.map((member) => {
					if (member.username === data.username) {
						member.isOnline = false;
					}

					return member;
				});
			});
		};

		const onExistingUsers = (data: { userNames: string[] }) => {
			setMembers((prev) => {
				return prev.map((member) => {
					if (data.userNames.includes(member.username)) {
						member.isOnline = true;
					}

					return member;
				});
			});
		};

		const onSetMessagesAndMemebers = (data: any) => {
			const previousMessage = data.messages.map((message: any) => {
				return {
					id: message.id,
					text: message.text,
					createdAt: message.createdAt,
					senderId: message.senderId,
					senderName: message.sender.username,
				};
			});

			setMessages(previousMessage);
			setMembers(data.users);
			setIsLoading(false);
		};

		socket = connectSocket(currentUser!.username);
		socket.connect();

		socket.emit('join_room', {
			roomName: params.roomName,
			username: currentUser!.username,
		});

		socket.on('setMessagesAndMembers', onSetMessagesAndMemebers);
		socket.on('receive_message', onReceiveMessage);
		socket.on('enter_new_member', onEnterNewMember);
		socket.on('leave_member', onLeaveMember);
		socket.on('online', onOnline);
		socket.on('offline', onOffline);
		socket.on('existingUsers', onExistingUsers);

		return () => {
			socket.off('setMessagesAndMembers', onSetMessagesAndMemebers);
			socket.off('receive_message', onReceiveMessage);
			socket.off('enter_new_member', onEnterNewMember);
			socket.off('leave_member', onLeaveMember);
			socket.off('online', onOnline);
			socket.off('offline', onOffline);
			socket.off('existingUsers', onExistingUsers);
			socket.disconnect();
		};
	}, [currentUser, params.roomName]);

	const sendMessage = () => {
		socket.emit('send_message', {
			senderId: currentUser!.id,
			roomName: params.roomName,
			senderName: currentUser!.username,
			text: message,
		});

		setMessage('');
	};

	const leaveChat = () => {
		const result = window.confirm('Are you sure you want to leave the chat?');

		if (result) {
			socket.emit('leave_room', { roomName: params.roomName, username: currentUser!.username });

			setCurrentUser({
				...currentUser!,
				chats: currentUser!.chats?.filter((chat) => chat.name !== params.roomName),
			});

			navigate('/');
		}
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	console.log(messages);

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
