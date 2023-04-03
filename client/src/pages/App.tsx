import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
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
import Explorer from './Explore';
import { socket } from '../socket';
import { User, Chat as ChatType } from '../types';

function App() {
	const queryClient = useQueryClient();

	useEffect(() => {
		const onOnline = (data: { userId: string }) => {
			const { userId } = data;

			const state = queryClient.getQueriesData(['members']);

			if (state) {
				queryClient.setQueriesData(['members'], (old: any) => {
					if (old) {
						return produce(old, (draftState: any) => {
							draftState.forEach((member: any) => {
								if (member.id === userId) {
									member.isOnline = true;
								}
							});
						});
					}
				});
			}
		};

		const onOffline = (data: { userId: string }) => {
			const { userId } = data;

			const state = queryClient.getQueriesData(['members']);

			if (state) {
				queryClient.setQueriesData(['members'], (old: any) => {
					if (old) {
						return produce(old, (draftState: any) => {
							draftState.forEach((member: any) => {
								if (member.id === userId) {
									member.isOnline = false;
								}
							});
						});
					}
				});
			}
		};

		const setMembersStatus = (data: { userIds: string[] }) => {
			const { userIds } = data;

			const state = queryClient.getQueriesData(['members']);

			if (state) {
				queryClient.setQueriesData(['members'], (old: any) => {
					if (old) {
						return produce(old, (draftState: any) => {
							draftState.forEach((member: User) => {
								if (userIds.includes(member.id)) {
									member.isOnline = true;
								} else {
									member.isOnline = false;
								}
							});
						});
					}
				});
			}
		};

		const onDestroyChat = (data: { chatId: string }) => {
			const { chatId } = data;

			queryClient.setQueryData(['chatRooms'], (old: any) => {
				return produce(old, (draftState: any) => {
					const newChatRooms = draftState.filter((chatRoom: any) => chatRoom.id !== chatId);
					draftState = newChatRooms;
				});
			});

			window.location.reload();
		};

		const onReceiveMessage = (data: {
			chatId: string;
			messageId: string;
			text: string;
			sender: User;
			createdAt: string;
			isPrivate: boolean;
			receiverAvatar?: string;
		}) => {
			console.log('got a message');

			const { chatId, messageId, text, sender, createdAt, isPrivate, receiverAvatar } = data;

			const currentChatId = window.location.href.split('/').pop();

			queryClient.setQueryData(['chatRooms'], (old: any) => {
				return produce(old, (draftState: any) => {
					draftState.forEach((chat: any) => {
						if (chat.id === chatId) {
							chat.messages[0] = { id: messageId, text, sender, createdAt };
						}
					});
				});
			});

			if (currentChatId === chatId) {
				queryClient.setQueryData(['messages', currentChatId], (old: any) => {
					return produce(old, (draftState: any) => {
						draftState.pages[0].unshift({ id: messageId, text, sender, createdAt, chatId, senderId: sender.id });
					});
				});
			} else {
				const state = queryClient.getQueryState<ChatType[]>(['chatRooms']);

				let isOnChatRoomList: boolean = false;

				if (state && state.data) {
					const chatRoomIds = state.data.map((chat: ChatType) => {
						return chat.id;
					});

					// Check the chat that needs to be updated on the chatroom list.
					isOnChatRoomList = chatRoomIds.includes(chatId);
				}

				// When there is no the chat that needs to be updated on the chatroom list.
				if (!isOnChatRoomList) {
					queryClient.setQueryData(['chatRooms'], (old: any) => {
						let newChat!: ChatType;

						if (isPrivate) {
							newChat = {
								id: chatId,
								createdAt,
								messages: [],
								type: 'PRIVATE',
							};
						}

						if (!isPrivate) {
							newChat = {
								id: chatId,
								createdAt,
								messages: [],
								type: 'GROUP',
							};
						}

						newChat.messages!.push({ id: messageId, text, sender, createdAt, chatId, senderId: sender.id });

						return [...old, newChat];
					});
				}

				// When there is the chat that needs to be updated on the chatroom list.
				if (isOnChatRoomList) {
					const state = queryClient.getQueryState<ChatType>(['chat', chatId]);

					// When the chat has been fetched then update the messages of the chat, otherwise it doesn't have to be updated.
					// It is going to fetch new messages.
					if (state) {
						queryClient.setQueryData(['messages', chatId], (old: any) => {
							return produce(old, (draftState: any) => {
								draftState.pages[0].unshift({ id: messageId, text, sender, createdAt, chatId, senderId: sender.id });
							});
						});
					}
				}
			}
		};

		const onEnterNewMember = (data: { newUser: User; chatId: string }) => {
			const { newUser, chatId } = data;

			newUser.isOnline = true;

			queryClient.setQueryData(['members', chatId], (old: any) => {
				if (old) {
					return produce(old, (draftState: any) => {
						draftState.push(newUser);
					});
				}
			});
		};

		const onLeaveMember = (data: { userId: string; chatId: string; isPrivate: boolean }) => {
			const { userId, chatId, isPrivate } = data;

			if (isPrivate) {
				return;
			}

			queryClient.setQueryData(['members', chatId], (old: any) => {
				if (old) {
					return produce(old, (draftState: any) => {
						const targetIndex = draftState.findIndex((member: any) => member.id === userId);
						draftState.splice(targetIndex, 1);
					});
				}
			});
		};

		socket.on('online', onOnline);
		socket.on('offline', onOffline);
		socket.on('set_members_status', setMembersStatus);
		socket.on('destroy_chat', onDestroyChat);
		socket.on('receive_message', onReceiveMessage);
		socket.on('enter_new_member', onEnterNewMember);
		socket.on('leave_member', onLeaveMember);

		return () => {
			socket.off('online', onOnline);
			socket.off('offline', onOffline);
			socket.off('set_members_status', setMembersStatus);
			socket.off('destroy_chat', onDestroyChat);
			socket.off('receive_message', onReceiveMessage);
			socket.off('enter_new_member', onEnterNewMember);
			socket.off('leave_member', onLeaveMember);
		};
	}, []);

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
