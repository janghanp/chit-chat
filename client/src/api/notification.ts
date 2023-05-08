import axios from 'axios';

import { User, Notification } from '../types';

export const createNotification = async (message: string, receiverId: string, senderId: string, link?: string) => {
	const { data } = await axios.post<User>(
		'/notification',
		{
			message,
			receiverId,
			senderId,
			link,
		},
		{ withCredentials: true }
	);

	return data;
};

export const fetchNotifications = async (userId: string) => {
	const { data } = await axios.get<Notification[]>('/notification/all', {
		params: {
			userId,
		},
		withCredentials: true,
	});

	return data;
};

export const deleteNotification = async (notificationId: string) => {
	const { data } = await axios.delete<Notification>(`/notification`, {
		data: { notificationId },
		withCredentials: true,
	});

	return data;
};

export const readAllNotifications = async () => {
	const { data } = await axios.patch<'OK'>(`/notification/readAll`, {}, { withCredentials: true });

	return data;
};

export const readNotification = async (notificationId: string) => {
	const { data } = await axios.patch<'OK'>(`/notification/read`, { notificationId }, { withCredentials: true });

	return data;
};
