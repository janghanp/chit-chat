import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

import RequireAuth from '../components/RequiredAuth';
import Layout from './Layout';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import AutoLogin from '../components/AutoLogin';
import Chat from './Chat';
import NoMatch from './NoMatch';
import Explorer from './Explorer';
import { useUser } from '../context/UserContext';
import { Message, User } from '../types';
import { connectSocket } from '../socket';

let socket: Socket;

function App() {
	const { currentUser } = useUser();

	const [messages, setMessages] = useState<Message[]>([]);
	const [members, setMembers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		if (currentUser?.username) {
			socket = connectSocket(currentUser?.username as string);
			socket.connect();

			setIsLoading(false);

			return () => {
				socket.disconnect();
			};
		}
	}, [currentUser?.username]);

	useEffect(() => {
		if (currentUser?.username) {
			const onReceiveMessage = (data: Message) => {
				const { id, senderId, senderName, text, createdAt } = data;

				setMessages((prev) => [...prev, { id, senderId, senderName, text, createdAt }]);
			};

			const onEnterNewMember = (data: { newUser: User }) => {
				console.log('new user entered');
				
				const newUser = data.newUser;
				newUser.isOnline = true;

				setMembers((prev) => {
					return [...prev, newUser];
				});
			};

			const onLeaveMember = (data: { username: string }) => {
				console.log('user left');
				
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

			const onOnlineUsers = (data: { userNames: string[] }) => {
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
			};

			socket.on('setMessagesAndMembers', onSetMessagesAndMemebers);
			socket.on('receive_message', onReceiveMessage);
			socket.on('enter_new_member', onEnterNewMember);
			socket.on('leave_member', onLeaveMember);
			socket.on('online', onOnline);
			socket.on('offline', onOffline);
			socket.on('onlineUsers', onOnlineUsers);

			return () => {
				socket.off('setMessagesAndMembers', onSetMessagesAndMemebers);
				socket.off('receive_message', onReceiveMessage);
				socket.off('enter_new_member', onEnterNewMember);
				socket.off('leave_member', onLeaveMember);
				socket.off('online', onOnline);
				socket.off('offline', onOffline);
				socket.off('onlineUsers', onOnlineUsers);
			};
		}
	}, [currentUser?.username]);

	return (
		<Routes>
			<Route element={<AutoLogin />}>
				<Route path="/" element={<Layout />}>
					<Route
						index
						element={
							<RequireAuth>
								<Home />
							</RequireAuth>
						}
					/>
					<Route
						path="/explorer"
						element={
							<RequireAuth>
								<Explorer socket={socket} />
							</RequireAuth>
						}
					/>
					<Route
						path="/chat/:roomName"
						element={
							<RequireAuth>
								<Chat socket={socket} members={members} messages={messages} isLoading={isLoading} />
							</RequireAuth>
						}
					/>
				</Route>

				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />

				<Route path="*" element={<NoMatch />} />
			</Route>
		</Routes>
	);
}

export default App;
