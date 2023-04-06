import axios from 'axios';

import { User } from '../types';

export const addFriend = async (senderId: string, receiverId: string) => {
	const { data } = await axios.patch<User>(
		'/user/friend',
		{
			senderId,
			receiverId,
		},
		{ withCredentials: true }
	);

	return data;
};

export const checkNotification = async (userId: string) => {
	const { data } = await axios.patch('/user/notification', { userId }, { withCredentials: true });

	return data;
};
