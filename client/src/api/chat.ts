import axios from 'axios';

import { Chat, Message } from '../types';

interface ChatWithIsNewMember {
	chat: Chat;
	isNewMember: boolean;
}

export const fetchChat = async (chatId: string, userId: string): Promise<ChatWithIsNewMember> => {
	const { data } = await axios.get<ChatWithIsNewMember>('http://localhost:8080/chat', {
		params: {
			chatId,
			userId,
		},
		withCredentials: true,
	});

	return data;
};

export const fetchChatRooms = async (userId: string): Promise<Chat[]> => {
	const { data } = await axios.get<Chat[]>('http://localhost:8080/chat/rooms', {
		params: {
			userId,
		},
		withCredentials: true,
	});

	return data;
};

export const fetchMessages = async (chatId: string, lastMessageId: string | undefined): Promise<Message[]> => {
	const { data } = await axios.get<Message[]>('http://localhost:8080/chat/messages', {
		params: {
			chatId,
			lastMessageId,
		},
		withCredentials: true,
	});

	return data;
};

export const createChat = async (formData: FormData): Promise<Chat> => {
	const { data } = await axios.post<Chat>('http://localhost:8080/chat', formData, { withCredentials: true });

	return data;
};

export const updateChat = async (chatId: string, userId: string): Promise<Chat> => {
	const { data } = await axios.patch<Chat>(
		'http://localhost:8080/chat/leave',
		{ chatId, userId },
		{ withCredentials: true }
	);

	return data;
};

export const deleteChatt = async (chatId: string): Promise<number> => {
	const { data } = await axios.delete<number>(`http://localhost:8080/chat/${chatId}`, { withCredentials: true });

	return data;
};
