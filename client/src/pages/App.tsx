import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import produce from 'immer';

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
import { useCurrentUserStore } from '../store';
import { User } from '../types';

function App() {
	const { setCurrentUser, currentUser } = useCurrentUserStore();

	const [isConnected, setIsConnected] = useState<boolean>(false);

	const queryClient = useQueryClient();

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
			const onOnline = (data: { userId: string }) => {
				const { userId } = data;

				queryClient.setQueriesData(['chat'], (old: any) => {
					const newOld = produce(old, (draftState: any) => {
						draftState.chat.users.forEach((user: any) => {
							if (user.id === userId) {
								user.isOnline = true;
							}
						});
					});

					return newOld;
				});
			};

			const onOffline = (data: { userId: string }) => {
				const { userId } = data;

				queryClient.setQueriesData(['chat'], (old: any) => {
					const newOld = produce(old, (draftState: any) => {
						draftState.chat.users.forEach((user: any) => {
							if (user.id === userId) {
								user.isOnline = false;
							}
						});
					});

					return newOld;
				});
			};

			const onOnlineUsers = (data: { userIds: string[] }) => {
				const { userIds } = data;

				queryClient.setQueriesData(['chat'], (old: any) => {
					const newOld = produce(old, (draftState: any) => {
						draftState.chat.users.forEach((user: any) => {
							if (userIds.includes(user.id)) {
								user.isOnline = true;
							}
						});
					});

					return newOld;
				});
			};

			//TODO
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

				queryClient.setQueryData(['chatRooms', currentUser!.id], (old: any) => {
					const newOld = produce(old, (draftState: any) => {
						draftState.chats.forEach((chat: any) => {
							if (chat.id === chatId) {
								chat.messages[0] = { id: messageId, text, sender, createdAt };
							}
						});
					});

					return newOld;
				});

				if (currentChatId === chatId) {
					queryClient.setQueryData(['chat', currentChatId], (old: any) => {
						const newOld = produce(old, (draftState: any) => {
							draftState.chat.messages.push({ id: messageId, sender, text, createdAt });
						});

						return newOld;
					});
				} else {
					const state = queryClient.getQueryState(['chat', chatId]);

					if (state) {
						queryClient.setQueryData(['chat', chatId], (old: any) => {
							const newOld = produce(old, (draftState: any) => {
								draftState.chat.messages.push({ id: messageId, sender, text, createdAt });
							});

							return newOld;
						});
					}
				}
			};

			const onEnterNewMember = (data: { newUser: User; chatId: string }) => {
				const { newUser, chatId } = data;

				const currentChatId = window.location.href.split('/').pop();

				newUser.isOnline = true;

				if (currentChatId === chatId) {
					queryClient.setQueryData(['chat', currentChatId], (old: any) => {
						const newOld = produce(old, (draftState: any) => {
							draftState.chat.users.push(newUser);
						});

						return newOld;
					});
				} else {
					const state = queryClient.getQueryState(['chat', chatId]);

					if (state) {
						queryClient.setQueryData(['chat', chatId], (old: any) => {
							const newOld = produce(old, (draftState: any) => {
								draftState.chat.users.push(newUser);
							});

							return newOld;
						});
					}
				}
			};

			const onLeaveMember = (data: { userId: string; chatId: string }) => {
				const { userId, chatId } = data;

				const currentChatId = window.location.href.split('/').pop();

				if (currentChatId === chatId) {
					queryClient.setQueryData(['chat', currentChatId], (old: any) => {
						const newOld = produce(old, (draftState: any) => {
							const newMembers = draftState.chat.users.filter((user: any) => user.id !== userId);
							draftState.chat.users = newMembers;
						});

						return newOld;
					});
				} else {
					const state = queryClient.getQueryState(['chat', chatId]);

					if (state) {
						queryClient.setQueryData(['chat', chatId], (old: any) => {
							const newOld = produce(old, (draftState: any) => {
								const newMembers = draftState.chat.users.filter((user: any) => user.id !== userId);
								draftState.chat.users = newMembers;
							});

							return newOld;
						});
					}
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
