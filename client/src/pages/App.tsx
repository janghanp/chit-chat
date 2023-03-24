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
import { socket } from '../socket';
import { useMembersStore, useCurrentUserStore, useMessagesStore, useChatsStore } from '../store';
import { User } from '../types';

function App() {
	const { setCurrentUser, currentUser } = useCurrentUserStore();

	const setMemberOnline = useMembersStore((state) => state.setMemberOnline);
	const setMemberOffline = useMembersStore((state) => state.setMemberOffline);
	const setMembersOnline = useMembersStore((state) => state.setMembersOnline);
	const addMember = useMembersStore((state) => state.addMember);
	const removeMember = useMembersStore((state) => state.removeMember);
	const addMessage = useMessagesStore((state) => state.addMessage);
	const updateChat = useChatsStore((state) => state.updateChat);

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


	//TODO: Change all listeners to make use of react-query.
	useEffect(() => {
		if (isConnected && currentUser) {
			socket.emit('user_connect', { userId: currentUser.id, chatIds: currentUser?.chats.map((chat) => chat.id) });
		}
	}, [isConnected, currentUser]);

	useEffect(() => {
		if (currentUser) {
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

			const onDestroyChat = (data: { chatId: string }) => {
				const { chatId } = data;

				const newChats = currentUser?.chats.filter((chat) => {
					return chat.id !== chatId;
				});

				setCurrentUser({ ...currentUser, chats: newChats });

				window.location.reload();
			};

			const onReceiveMessage = (data: {
				chatId: string;
				messageId: string;
				text: string;
				sender: User;
				createdAt: string;
			}) => {
				const { chatId, messageId, text, sender, createdAt } = data;

				const currentChatId = window.location.href.split('/').pop();

				updateChat(chatId, { id: messageId, text, sender, createdAt });

				if (currentChatId === chatId) {
					addMessage({ id: messageId, sender, text, createdAt });
				}
			};

			const onEnterNewMember = (data: { newUser: User; chatId: string }) => {
				const { newUser, chatId } = data;

				const currentChatId = window.location.href.split('/').pop();

				newUser.isOnline = true;

				if (currentChatId === chatId) {
					addMember(newUser);
				}
			};

			const onLeaveMember = (data: { userId: string; chatId: string }) => {
				const { userId, chatId } = data;

				const currentChatId = window.location.href.split('/').pop();

				if (currentChatId === chatId) {
					removeMember(userId);
				}
			};

			socket.on('online', onOnline);
			socket.on('offline', onOffline);
			socket.on('onlineUsers', onOnlineUsers);
			socket.on('destroy_chat', onDestroyChat);
			socket.on('receive_message', onReceiveMessage);
			socket.on('enter_new_member', onEnterNewMember);
			socket.on('leave_member', onLeaveMember);

			return () => {
				socket.off('online', onOnline);
				socket.off('offline', onOffline);
				socket.off('onlineUsers', onOnlineUsers);
				socket.off('destroy_chat', onDestroyChat);
				socket.off('receive_message', onReceiveMessage);
				socket.off('enter_new_member', onEnterNewMember);
				socket.off('leave_member', onLeaveMember);
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
