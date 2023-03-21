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
	const { currentUser, setCurrentUser } = useUser();

	const [messages, setMessages] = useState<Message[]>([]);
	const [members, setMembers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const currentChatId = window.location.href.split('/').pop();

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
			const onReceiveMessage = (data: {
				chatId: string;
				messageId: string;
				text: string;
				sender: User;
				createdAt: string;
			}) => {
				const { chatId, messageId, text, sender, createdAt } = data;

				setCurrentUser((prev) => {
					const newChats = prev!.chats.map((chat) => {
						if (chat.id === chatId) {
							chat.messages![0] = { id: messageId, text, sender, createdAt };
							return { ...chat };
						}

						return chat;
					});

					return { ...prev, chats: newChats } as User;
				});

				if (currentChatId === chatId) {
					setMessages((prev) => [...prev, { id: messageId, sender, text, createdAt }]);
				}
			};

			const onEnterNewMember = (data: { newUser: User; chatId: string }) => {
				const { newUser, chatId } = data;

				newUser.isOnline = true;

				if (currentChatId === chatId) {
					setMembers((prev) => {
						return [...prev, newUser];
					});
				}
			};

			const onLeaveMember = (data: { username: string; chatId: string }) => {
				const { username, chatId } = data;

				if (currentChatId === chatId) {
					setMembers((prev) => {
						return prev.filter((member) => {
							return member.username !== username;
						});
					});
				}
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

			socket.on('receive_message', onReceiveMessage);
			socket.on('enter_new_member', onEnterNewMember);
			socket.on('leave_member', onLeaveMember);
			socket.on('online', onOnline);
			socket.on('offline', onOffline);
			socket.on('onlineUsers', onOnlineUsers);

			return () => {
				socket.off('receive_message', onReceiveMessage);
				socket.off('enter_new_member', onEnterNewMember);
				socket.off('leave_member', onLeaveMember);
				socket.off('online', onOnline);
				socket.off('offline', onOffline);
				socket.off('onlineUsers', onOnlineUsers);
			};
		}
	}, [currentUser?.username]);

	useEffect(() => {
		if (currentUser?.username && socket && socket.connected) {
			if (currentUser.chats.length > 0) {
				socket.emit('join_all_chats', { chatIds: currentUser?.chats.map((chat) => chat.id) });
			}
		}
	}, [socket && socket.connected]);

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
						path="/chat/:chatId"
						element={
							<RequireAuth>
								<Chat
									socket={socket}
									members={members}
									messages={messages}
									isLoading={isLoading}
									setMembers={setMembers}
									setMessages={setMessages}
								/>
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
