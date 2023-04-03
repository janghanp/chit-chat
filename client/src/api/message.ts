import axios from 'axios';

import { Message } from '../types';

export const createMessage = async (chatId: string, text: string, senderId: string) => {
	const { data } = await axios.post('/message', { chatId, text, senderId }, { withCredentials: true });

	return data;
};

export const fetchMessages = async (chatId: string, lastMessageId: string | undefined): Promise<Message[]> => {
	const { data } = await axios.get<Message[]>('/message', {
		params: {
			chatId,
			lastMessageId,
		},
		withCredentials: true,
	});

	return data;
};
