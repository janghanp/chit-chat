import axios from 'axios';

import { Chat, ChatWithIsNewMember, User, PreviousChat, Attachment } from '../types';

export const fetchChat = async (chatId: string, userId: string) => {
	const { data } = await axios.get<ChatWithIsNewMember>('/chat', {
		params: {
			chatId,
			userId,
		},
		withCredentials: true,
	});

	return data;
};

export const fetchChatRooms = async (userId: string) => {
	const { data } = await axios.get<Chat[]>('/chat/rooms', {
		params: {
			userId,
		},
		withCredentials: true,
	});

	return data;
};

export const createChat = async (formData: FormData) => {
	const { data } = await axios.post<Chat>('/chat', formData, { withCredentials: true });

	return data;
};

export const createPrivateChat = async (senderId: string, receiverId: string) => {
	const { data } = await axios.post<Chat | PreviousChat>(
		'/chat/private',
		{ senderId, receiverId },
		{ withCredentials: true }
	);

	return data;
};

export const leaveChat = async (chatId: string, userId: string) => {
	const { data } = await axios.patch<Chat>('/chat/leave', { chatId, userId }, { withCredentials: true });

	return data;
};

export const deleteChat = async (chatId: string) => {
	const { data } = await axios.delete<'OK'>(`/chat`, { data: { chatId }, withCredentials: true });

	return data;
};

export const fetchMembers = async (chatId: string) => {
	const { data } = await axios.get<User[]>('/chat/members', {
		params: {
			chatId,
		},
		withCredentials: true,
	});

	return data;
};

export const updateChat = async (formData: FormData) => {
	const { data } = await axios.patch<'OK'>('/chat', formData, { withCredentials: true });

	return data;
};

export const uploadAttachments = async (chatId: string, formData: FormData) => {
	const { data } = await axios.post<Attachment>(`/chat/${chatId}/attachments`, formData, { withCredentials: true });

	return data;
};

export const deleteAttachments = async (chatId: string, public_id: string) => {
	const { data } = await axios.delete<any>(`/chat/${chatId}/attachments`, {
		data: { public_id },
		withCredentials: true,
	});

	return data;
};
