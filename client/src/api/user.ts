import axios from 'axios';

import { Friend } from '../types';

export const addFriend = async (senderId: string, receiverId: string) => {
	const { data } = await axios.patch<'OK'>(
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
	const { data } = await axios.patch<'OK'>('/user/notification', { userId }, { withCredentials: true });

	return data;
};

export const fetchFriends = async () => {
	const { data } = await axios.get<Friend[]>('/user/friends', { withCredentials: true });

	return data;
};

export const deleteFriend = async (senderId: string, receiverId: string) => {
	const { data } = await axios.delete<'OK'>('/user/friend', {
		data: {
			senderId,
			receiverId,
		},
		withCredentials: true,
	});

	return data;
};
