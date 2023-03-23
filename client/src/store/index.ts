import { create } from 'zustand';

import { Chat, Message, User } from '../types';

interface currentUserStore {
	currentUser: User | null;
	setCurrentUser: (currentUser: User | null) => void;
}

interface MembersStore {
	members: User[];
	setMembers: (members: User[]) => void;
	addMember: (memberToAdd: User) => void;
	removeMember: (memberId: string) => void;
	setMemberOnline: (memberId: string) => void;
	setMemberOffline: (memberId: string) => void;
	setMembersOnline: (memberIds: string[]) => void;
}

interface MessagesStore {
	messages: Message[];
	setMessages: (messages: Message[]) => void;
	addMessage: (messageToAdd: Message) => void;
}

interface ChatsStore {
	chats: Chat[];
	setChats: (cahts: Chat[]) => void;
	addChat: (chat: Chat) => void;
	removeChat: (chatId: string) => void;
}

interface CurrentChatStore {
	currentChat: Chat | null;
	setCurrentChat: (currentChat: Chat | null) => void;
}

export const useCurrentUserStore = create<currentUserStore>()((set) => ({
	currentUser: null,
	setCurrentUser: (currentUser: User | null) => set({ currentUser }),
}));

export const useMembersStore = create<MembersStore>()((set) => ({
	members: [],

	setMembers: (members: User[]) => set({ members }),

	addMember: (memberToAdd: User) =>
		set((state) => ({
			members: [...state.members, memberToAdd],
		})),

	removeMember: (memberId: string) =>
		set((state) => ({
			members: state.members.filter((member) => member.id !== memberId),
		})),

	setMemberOnline: (memberId: string) =>
		set((state) => ({
			members: state.members.map((member) => {
				if (member.id === memberId) {
					member.isOnline = true;
					return member;
				}

				return member;
			}),
		})),

	setMemberOffline: (memberId: string) =>
		set((state) => ({
			members: state.members.map((member) => {
				if (member.id === memberId) {
					member.isOnline = false;
					return member;
				}

				return member;
			}),
		})),

	setMembersOnline: (memberIds: string[]) =>
		set((state) => ({
			members: state.members.map((member) => {
				if (memberIds.includes(member.id)) {
					member.isOnline = true;
					return member;
				}

				return member;
			}),
		})),
}));

export const useMessagesStore = create<MessagesStore>()((set) => ({
	messages: [],

	setMessages: (messages: Message[]) => set({ messages }),

	addMessage: (messageToAdd: Message) =>
		set((state) => ({
			messages: [...state.messages, messageToAdd],
		})),
}));

export const useChatsStore = create<ChatsStore>()((set) => ({
	chats: [],

	setChats: (chats: Chat[]) => set({ chats }),

	addChat: (chatToAdd: Chat) =>
		set((state) => ({
			chats: [...state.chats, chatToAdd],
		})),

	removeChat: (chatId: string) =>
		set((state) => ({
			chats: state.chats.filter((chat) => chat.id !== chatId),
		})),
}));

export const useCurrentChatStore = create<CurrentChatStore>()((set) => ({
	currentChat: null,
	setCurrentChat: (currentChat: Chat | null) => set({ currentChat }),
}));
