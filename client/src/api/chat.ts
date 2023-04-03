import axios from 'axios';

import { Chat, Message, User } from '../types';

interface ChatWithIsNewMember {
	chat: Chat;
	isNewMember: boolean;
}

export const fetchChat = async (chatId: string, userId: string): Promise<ChatWithIsNewMember> => {
	const { data } = await axios.get<ChatWithIsNewMember>('/chat', {
		params: {
			chatId,
			userId,
		},
		withCredentials: true,
	});

	return data;
};

export const fetchChatRooms = async (userId: string): Promise<Chat[]> => {
	const { data } = await axios.get<Chat[]>('/chat/rooms', {
		params: {
			userId,
		},
		withCredentials: true,
	});

	return data;
};

export const fetchMessages = async (chatId: string, lastMessageId: string | undefined): Promise<Message[]> => {
	const { data } = await axios.get<Message[]>('/chat/messages', {
		params: {
			chatId,
			lastMessageId,
		},
		withCredentials: true,
	});

	return data;
};

export const createChat = async (formData: FormData): Promise<Chat> => {
	const { data } = await axios.post<Chat>('/chat', formData, { withCredentials: true });

	return data;
};

export const createPrivateChat = async (senderId: string, receiverId: string) => {
	const { data } = await axios.post<Chat>('/chat/private', { senderId, receiverId }, { withCredentials: true });

	return data;
};

export const leaveChat = async (chatId: string, userId: string): Promise<Chat> => {
	const { data } = await axios.patch<Chat>('/chat/leave', { chatId, userId }, { withCredentials: true });

	return data;
};

export const deleteChat = async (chatId: string): Promise<number> => {
	const { data } = await axios.delete<number>(`/chat/${chatId}`, { withCredentials: true });

	return data;
};

export const fetchMembers = async (chatId: string): Promise<User[]> => {
	const { data } = await axios.get<User[]>('/chat/members', {
		params: {
			chatId,
		},
		withCredentials: true,
	});

	return data;
};

export const updateChat = async (formData: FormData): Promise<Chat> => {
	const { data } = await axios.patch<Chat>('/chat', formData, { withCredentials: true });

	return data;
};
