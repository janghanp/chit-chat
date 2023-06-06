import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { InfiniteData, useQueryClient } from '@tanstack/react-query';
import produce from 'immer';

import { socket } from '../socket';
import { User, Chat as ChatType, Message, Notification, Friend, AttachmentInfo } from '../types';
import AutoLogin from '../components/AutoLogin';
import RequireAuth from '../components/RequiredAuth';
import Layout from './Layout';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import Chat from './Chat';
import NoMatch from './NoMatch';
import Explorer from './Explore';
import Friends from './Friends';
import Settings from './Settings';

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

			queryClient.setQueryData<ChatType[]>(['privateChatRooms'], (old) => {
				if (old) {
					return produce(old, (draftState) => {
						draftState.forEach((chat) => {
							if (chat.type === 'PRIVATE' && chat.users![0].id === userId) {
								chat.isReceiverOnline = true;
							}
						});
					});
				}
			});
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

			queryClient.setQueryData<ChatType[]>(['privateChatRooms'], (old) => {
				if (old) {
					return produce(old, (draftState) => {
						draftState.forEach((chat) => {
							if (chat.type === 'PRIVATE' && chat.users![0].id === userId) {
								chat.isReceiverOnline = false;
							}
						});
					});
				}
			});
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
			attachments: AttachmentInfo[];
			isPrivate: boolean;
		}) => {
			const { chatId, messageId, text, sender, createdAt, isPrivate, attachments } = data;

			const currentChatId = window.location.href.split('/').pop();

			// Update a preview message on the sidebar.
			if (isPrivate) {
				queryClient.setQueryData<ChatType[]>(['privateChatRooms'], (old) => {
					if (old) {
						return produce(old, (draftState) => {
							draftState.forEach((chat) => {
								if (chat.id === chatId) {
									if (!text && attachments.length > 0) {
										chat.messages = [{ id: messageId, text: 'image', sender, createdAt, senderId: sender.id, chatId }];
									} else {
										chat.messages = [{ id: messageId, text, sender, createdAt, senderId: sender.id, chatId }];
									}
								}
							});
						});
					}
				});
			} else {
				queryClient.setQueryData<ChatType[]>(['groupChatRooms'], (old) => {
					if (old) {
						return produce(old, (draftState) => {
							draftState.forEach((chat) => {
								if (chat.id === chatId) {
									if (!text && attachments.length > 0) {
										chat.messages = [{ id: messageId, text: 'image', sender, createdAt, senderId: sender.id, chatId }];
									} else {
										chat.messages = [{ id: messageId, text, sender, createdAt, senderId: sender.id, chatId }];
									}
								}
							});
						});
					}
				});
			}

			// Update a message in the chat.
			if (currentChatId === chatId) {
				const state = queryClient.getQueryState<User>(['currentUser']);

				if (state && state.data?.id === sender.id) {
					// sender perspective
					queryClient.setQueryData<InfiniteData<Message[]>>(['messages', currentChatId], (old) => {
						if (old) {
							return produce(old, (draftState) => {
								// There is an optimistic update about messages when creating a message so just override with new data.
								draftState.pages[0][0] = {
									id: messageId,
									text,
									sender,
									createdAt,
									chatId,
									senderId: sender.id,
									attachments,
								};
							});
						}
					});
				} else {
					// reciver perspective
					queryClient.setQueryData<InfiniteData<Message[]>>(['messages', currentChatId], (old) => {
						if (old) {
							return produce(old, (draftState) => {
								draftState.pages[0].unshift({
									id: messageId,
									text,
									sender,
									createdAt,
									chatId,
									senderId: sender.id,
									attachments,
								});
							});
						}
					});
				}
			} else {
				if (isPrivate) {
					let isOnChatRoomList = false;

					const privateChats = queryClient.getQueryState<ChatType[]>(['privateChatRooms']);

					if (privateChats && privateChats.data) {
						const privateChatIds = privateChats.data.map((privateChat) => {
							return privateChat.id;
						});

						// Check the chat that needs to be updated on the chatroom list.
						isOnChatRoomList = privateChatIds.includes(chatId);
					}

					if (!isOnChatRoomList) {
						queryClient.setQueryData<ChatType[]>(['privateChatRooms'], (old) => {
							if (old) {
								const newChat: ChatType = {
									id: chatId,
									createdAt,
									messages: [],
									readBy: [],
									type: 'PRIVATE',
									users: [
										{
											id: sender.id,
											username: sender.username,
											avatar: sender.avatar,
										},
									],
								};

								newChat.messages!.push({
									id: messageId,
									text,
									sender,
									createdAt,
									chatId,
									senderId: sender.id,
									attachments,
								});

								return [...old, newChat];
							}
						});
					}

					if (isOnChatRoomList) {
						const state = queryClient.getQueryState<ChatType>(['chat', chatId]);

						const currentUser = queryClient.getQueryData<User>(['currentUser']);

						// Show new message indicator
						if (sender.id !== currentUser!.id) {
							queryClient.setQueryData<ChatType[]>(['privateChatRooms'], (old) => {
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
										draftState.pages[0].unshift({
											id: messageId,
											text,
											sender,
											createdAt,
											chatId,
											senderId: sender.id,
											attachments,
										});
									});
								}
							});
						}
					}
				} else {
					let isOnChatRoomList = false;

					const groupChats = queryClient.getQueryState<ChatType[]>(['groupChatRooms']);

					if (groupChats && groupChats.data) {
						const groupChatIds = groupChats.data.map((groupChat) => {
							return groupChat.id;
						});

						// Check the chat that needs to be updated on the chatroom list.
						isOnChatRoomList = groupChatIds.includes(chatId);
					}

					if (!isOnChatRoomList) {
						queryClient.setQueryData<ChatType[]>(['groupChatRooms'], (old) => {
							if (old) {
								const newChat: ChatType = {
									id: chatId,
									createdAt,
									messages: [],
									readBy: [],
									type: 'GROUP',
								};

								newChat.messages!.push({
									id: messageId,
									text,
									sender,
									createdAt,
									chatId,
									senderId: sender.id,
									attachments,
								});

								return [...old, newChat];
							}
						});
					}

					if (isOnChatRoomList) {
						const state = queryClient.getQueryState<ChatType>(['chat', chatId]);

						const currentUser = queryClient.getQueryData<User>(['currentUser']);

						// Show new message indicator
						if (sender.id !== currentUser!.id) {
							queryClient.setQueryData<ChatType[]>(['groupChatRooms'], (old) => {
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
										draftState.pages[0].unshift({
											id: messageId,
											text,
											sender,
											createdAt,
											chatId,
											senderId: sender.id,
											attachments,
										});
									});
								}
							});
						}
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

		const onReceiveNotification = (data: Notification) => {
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

		const onIsOnline = (data: { isOnline: boolean; chatId: string }) => {
			const { isOnline, chatId } = data;

			queryClient.setQueryData<ChatType[]>(['privateChatRooms'], (old) => {
				if (old) {
					return produce(old, (draftState) => {
						draftState.forEach((chat) => {
							if (chat.type === 'PRIVATE' && chat.id === chatId && isOnline) {
								chat.isReceiverOnline = true;
							}
						});
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
		socket.on('receive_notification', onReceiveNotification);
		socket.on('accept_friend', onAcceptFriend);
		socket.on('remove_friend', onRemoveFriend);
		socket.on('is_online', onIsOnline);

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
			socket.off('is_online', onIsOnline);
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
						<Route path="/settings" element={<Settings />} />
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
