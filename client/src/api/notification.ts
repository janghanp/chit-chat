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

export const deleteNotification = async (notificationId: string) => {
	const { data } = await axios.delete(`/notification/${notificationId}`, { withCredentials: true });

	return data;
};

export const readAllNotifications = async () => {
	const { data } = await axios.patch(`/notification/readAll`, {}, { withCredentials: true });

	return data;
};
