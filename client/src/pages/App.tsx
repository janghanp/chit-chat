import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { InfiniteData, useQueryClient } from '@tanstack/react-query';
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
import { User, Chat as ChatType, Message, Notification, Friend } from '../types';
import Friends from './Friends';

function App() {
	const queryClient = useQueryClient();

	useEffect(() => {
		const onOnline = (data: { userId: string }) => {
			const { userId } = data;

			const state = queryClient.getQueriesData<User[]>(['members']);

			if (state) {
				queryClient.setQueriesData<User[]>(['members'], (old) => {
					if (old) {
						return produce(old, (draftState) => {
							draftState.forEach((member) => {
								if (member.id === userId) {
									member.isOnline = true;
								}
							});
						});
					}
				});

				queryClient.setQueryData<User[]>(['friends'], (old) => {
					if (old) {
						return produce(old, (draftState) => {
							draftState.forEach((member) => {
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

			const state = queryClient.getQueriesData<User[]>(['members']);

			if (state) {
				queryClient.setQueriesData<User[]>(['members'], (old) => {
					if (old) {
						return produce(old, (draftState) => {
							draftState.forEach((member) => {
								if (member.id === userId) {
									member.isOnline = false;
								}
							});
						});
					}
				});

				queryClient.setQueryData<User[]>(['friends'], (old) => {
					if (old) {
						return produce(old, (draftState) => {
							draftState.forEach((member) => {
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

			const state = queryClient.getQueriesData<User[]>(['members']);

			if (state) {
				queryClient.setQueriesData<User[]>(['members'], (old) => {
					if (old) {
						return produce(old, (draftState) => {
							draftState.forEach((member) => {
								if (userIds.includes(member.id)) {
									member.isOnline = true;
								} else {
									member.isOnline = false;
								}
							});
						});
					}
				});

				queryClient.setQueryData<User[]>(['friends'], (old) => {
					if (old) {
						return produce(old, (draftState) => {
							draftState.forEach((member) => {
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
			window.location.href = '/';
		};

		const onReceiveMessage = (data: {
			chatId: string;
			messageId: string;
			text: string;
			sender: User;
			createdAt: string;
			isPrivate: boolean;
		}) => {
			const { chatId, messageId, text, sender, createdAt, isPrivate } = data;

			const currentChatId = window.location.href.split('/').pop();

			queryClient.setQueryData<ChatType[]>(['chatRooms'], (old) => {
				if (old) {
					return produce(old, (draftState) => {
						draftState.forEach((chat) => {
							if (chat.id === chatId) {
								chat.messages = [{ id: messageId, text, sender, createdAt, senderId: sender.id, chatId }];
							}
						});
					});
				}
			});

			if (currentChatId === chatId) {
				queryClient.setQueryData<InfiniteData<Message[]>>(['messages', currentChatId], (old) => {
					if (old) {
						return produce(old, (draftState) => {
							draftState.pages[0].unshift({ id: messageId, text, sender, createdAt, chatId, senderId: sender.id });
						});
					}
				});
			} else {
				const state = queryClient.getQueryState<ChatType[]>(['chatRooms']);

				let isOnChatRoomList: boolean = false;

				if (state && state.data) {
					const chatRoomIds = state.data.map((chat) => {
						return chat.id;
					});

					// Check the chat that needs to be updated on the chatroom list.
					isOnChatRoomList = chatRoomIds.includes(chatId);
				}

				// When there is no the chat that needs to be updated on the chatroom list.
				if (!isOnChatRoomList) {
					queryClient.setQueryData<ChatType[]>(['chatRooms'], (old) => {
						if (old) {
							let newChat!: ChatType;

							if (isPrivate) {
								newChat = {
									id: chatId,
									createdAt,
									messages: [],
									readBy: [],
									type: 'PRIVATE',
								};
							}

							if (!isPrivate) {
								newChat = {
									id: chatId,
									createdAt,
									messages: [],
									readBy: [],
									type: 'GROUP',
								};
							}

							newChat.messages!.push({ id: messageId, text, sender, createdAt, chatId, senderId: sender.id });

							return [...old, newChat];
						}
					});
				}

				// When there is the chat that needs to be updated on the chatroom list.
				if (isOnChatRoomList) {
					const state = queryClient.getQueryState<ChatType>(['chat', chatId]);

					const currentUser = queryClient.getQueryData<User>(['currentUser']);

					// Show new message indicator
					if (sender.id !== currentUser!.id) {
						queryClient.setQueryData<ChatType[]>(['chatRooms'], (old) => {
							if (old) {
								return produce(old, (draftState) => {
									draftState.forEach((chat) => {
										if (chat.id === chatId) {
											chat.readBy = chat.readBy.filter((userId) => userId !== currentUser!.id);
										}
									});
								});
							}
						});
					}

					// When the chat has been fetched then update the messages of the chat, otherwise it doesn't have to be updated.
					// It is going to fetch new messages.
					if (state) {
						queryClient.setQueryData<InfiniteData<Message[]>>(['messages', chatId], (old) => {
							if (old) {
								return produce(old, (draftState) => {
									draftState.pages[0].unshift({ id: messageId, text, sender, createdAt, chatId, senderId: sender.id });
								});
							}
						});
					}
				}
			}
		};

		const onEnterNewMember = (data: { newUser: User; chatId: string }) => {
			const { newUser, chatId } = data;

			newUser.isOnline = true;

			queryClient.setQueryData<User[]>(['members', chatId], (old) => {
				if (old) {
					return produce(old, (draftState) => {
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

			queryClient.setQueryData<User[]>(['members', chatId], (old) => {
				if (old) {
					return produce(old, (draftState) => {
						const targetIndex = draftState.findIndex((member) => member.id === userId);
						draftState.splice(targetIndex, 1);
					});
				}
			});
		};

		const onReceiveNotification = (data: any) => {
			queryClient.setQueriesData<Notification[]>(['notifications'], (old) => {
				if (old) {
					return [...old, data];
				}
			});

			queryClient.setQueryData<User>(['currentUser'], (old) => {
				if (old) {
					return { ...old, hasNewNotification: true };
				}
			});
		};

		const onAcceptFriend = (data: Friend) => {
			queryClient.setQueryData<Friend[]>(['friends'], (old) => {
				if (old) {
					return [...old, data];
				}
			});
		};

		const onRemoveFriend = (data: { senderId: string }) => {
			const { senderId } = data;

			queryClient.setQueryData<Friend[]>(['friends'], (old) => {
				if (old) {
					return old.filter((friend) => friend.id !== senderId);
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
		socket.on('receive_notification', onReceiveNotification);
		socket.on('accept_friend', onAcceptFriend);
		socket.on('remove_friend', onRemoveFriend);

		return () => {
			socket.off('online', onOnline);
			socket.off('offline', onOffline);
			socket.off('set_members_status', setMembersStatus);
			socket.off('destroy_chat', onDestroyChat);
			socket.off('receive_message', onReceiveMessage);
			socket.off('enter_new_member', onEnterNewMember);
			socket.off('leave_member', onLeaveMember);
			socket.off('receive_notification', onReceiveNotification);
			socket.off('accept_friend', onAcceptFriend);
			socket.off('remove_friend', onRemoveFriend);
		};
	}, [queryClient]);

	return (
		<Routes>
			<Route element={<AutoLogin />}>
				<Route element={<RequireAuth />}>
					<Route path="/" element={<Layout />}>
						<Route index element={<Home />} />
						<Route path="/explorer" element={<Explorer />} />
						<Route path="/chat/:chatId" element={<Chat />} />
						<Route path="/friends" element={<Friends />} />
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
