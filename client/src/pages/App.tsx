import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';

import RequireAuth from '../components/RequiredAuth';
import Layout from './Layout';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import AutoLogin from '../components/AutoLogin';
import Chat from './Chat';
import NoMatch from './NoMatch';
import Explorer from './Explorer';
import { User } from '../types';
import { socket } from '../socket';
import { useMembersStore, useMessagesStore, useCurrentUserStore, useChatsStore, useCurrentChatStore } from '../store';

function App() {
	const { setCurrentUser, currentUser } = useCurrentUserStore();

	const addMember = useMembersStore((state) => state.addMember);
	const removeMember = useMembersStore((state) => state.removeMember);
	const setMemberOnline = useMembersStore((state) => state.setMemberOnline);
	const setMemberOffline = useMembersStore((state) => state.setMemberOffline);
	const setMembersOnline = useMembersStore((state) => state.setMembersOnline);
	const setChats = useChatsStore((state) => state.setChats);
	const currentChat = useCurrentChatStore((state) => state.currentChat);

	const addMessage = useMessagesStore((state) => state.addMessage);

	const [isConnected, setIsConnected] = useState<boolean>(false);

	//No connection when a user is in login or register page.
	useEffect(() => {
		if (currentUser) {
			socket.connect();
		}
	}, [currentUser]);

	// Managing a socket connection.
	useEffect(() => {
		function onConnect() {
			setIsConnected(true);
		}

		function onDisConnect() {
			setIsConnected(false);
		}

		socket.on('connect', onConnect);
		socket.on('disconnect', onDisConnect);

		return () => {
			socket.off('connect', onConnect);
			socket.off('disconnect', onDisConnect);
		};
	}, []);

	useEffect(() => {
		if (isConnected && currentUser) {
			socket.emit('user_connect', { userId: currentUser.id, chatIds: currentUser?.chats.map((chat) => chat.id) });
		}
	}, [isConnected, currentUser]);

	useEffect(() => {
		if (currentUser) {
			const onReceiveMessage = (data: {
				chatId: string;
				messageId: string;
				text: string;
				sender: User;
				createdAt: string;
			}) => {
				const { chatId, messageId, text, sender, createdAt } = data;

				const newChats = currentUser!.chats.map((chat) => {
					if (chat.id === chatId) {
						chat.messages![0] = { id: messageId, text, sender, createdAt };
						return { ...chat };
					}

					return chat;
				});

				setChats(newChats);

				//! lexical scope now, it needs to be dynamic
				//? Pass a parameter?
				//? Event listeners that need a currentChat id can go inside Chat.tsx?
				// if (currentChat?.id === chatId) {
					addMessage({ id: messageId, sender, text, createdAt });
				// }
			};

			const onEnterNewMember = (data: { newUser: User; chatId: string }) => {
				const { newUser, chatId } = data;

				newUser.isOnline = true;

				//!
				if (currentChat?.id === chatId) {
					addMember(newUser);
				}
			};

			const onLeaveMember = (data: { userId: string; chatId: string }) => {
				const { userId, chatId } = data;

				//!
				if (currentChat?.id === chatId) {
					removeMember(userId);
				}
			};

			const onDestroyChat = (data: { chatId: string }) => {
				const { chatId } = data;

				const newChats = currentUser?.chats.filter((chat) => {
					return chat.id !== chatId;
				});

				setCurrentUser({ ...currentUser, chats: newChats });

				window.location.reload();
			};

			const onOnline = (data: { userId: string }) => {
				const { userId } = data;

				setMemberOnline(userId);
			};

			const onOffline = (data: { userId: string }) => {
				const { userId } = data;

				setMemberOffline(userId);
			};

			const onOnlineUsers = (data: { userIds: string[] }) => {
				const { userIds } = data;

				setMembersOnline(userIds);
			};

			socket.on('receive_message', onReceiveMessage);
			socket.on('enter_new_member', onEnterNewMember);
			socket.on('leave_member', onLeaveMember);
			socket.on('destroy_chat', onDestroyChat);
			socket.on('online', onOnline);
			socket.on('offline', onOffline);
			socket.on('onlineUsers', onOnlineUsers);

			return () => {
				socket.off('receive_message', onReceiveMessage);
				socket.off('enter_new_member', onEnterNewMember);
				socket.off('leave_member', onLeaveMember);
				socket.off('destroy_chat', onDestroyChat);
				socket.off('online', onOnline);
				socket.off('offline', onOffline);
				socket.off('onlineUsers', onOnlineUsers);
			};
		}
	}, [currentUser]);

	return (
		<Routes>
			<Route element={<AutoLogin />}>
				<Route element={<RequireAuth />}>
					<Route path="/" element={<Layout />}>
						<Route index element={<Home />} />
						<Route path="/explorer" element={<Explorer />} />
						<Route path="/chat/:chatId" element={<Chat />} />
					</Route>
				</Route>

				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />

				<Route path="*" element={<NoMatch />} />
			</Route>
		</Routes>
	);
}

export default App;
