import axios from 'axios';

export const fetchChat = async (chatId: string, userId: string) => {
	const { data } = await axios.get('http://localhost:8080/chat', {
		params: {
			chatId,
			userId,
		},
		withCredentials: true,
	});

	return data;
};

export const fetchChatRooms = async (userId: string) => {
	const { data } = await axios.get('http://localhost:8080/chat/rooms', {
		params: {
			userId,
		},
		withCredentials: true,
	});

	return data;
};

export const fetchMessages = async (chatId: string, lastMessageId: string | undefined) => {
	const { data } = await axios.get('http://localhost:8080/chat/messages', {
		params: {
			chatId,
			lastMessageId,
		},
		withCredentials: true,
	});

	return data;
};

export const createChat = async (formData: FormData) => {
	const { data } = await axios.post('http://localhost:8080/chat', formData, { withCredentials: true });

	return data;
};

export const updateChat = async (chatId: string, userId: string) => {
	const { data } = await axios.patch('http://localhost:8080/chat/leave', { chatId, userId }, { withCredentials: true });

	return data;
};

export const deleteChatt = async (chatId: string) => {
	const { data } = await axios.delete(`http://localhost:8080/chat/${chatId}`, { withCredentials: true });

	return data;
};
