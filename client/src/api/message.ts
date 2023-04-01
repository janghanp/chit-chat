import axios from 'axios';

export const createMessage = async (chatId: string, text: string, senderId: string) => {
	const { data } = await axios.post('/chat/message', { chatId, text, senderId }, { withCredentials: true });

	return data;
};
