import axios from 'axios';

import { User } from '../types';

export const createNotification = async (message: string, receiverId: string, senderId: string) => {
	const { data } = await axios.post<User>(
		'/notification',
		{
			message,
			receiverId,
			senderId,
		},
		{ withCredentials: true }
	);

	return data;
};

export const fetchNotifications = async (userId: string) => {
	const { data } = await axios.get('/notification', {
		params: {
			userId,
		},
		withCredentials: true,
	});

	return data;
};
