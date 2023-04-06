import axios from 'axios';

export const addFriend = async (senderId: string, receiverId: string) => {
	const { data } = await axios.patch(
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

export const fetchFriends = async () => {
	const { data } = await axios.get('/user/friends', { withCredentials: true });

	return data;
};

export const deleteFriend = async (senderId: string, receiverId: string) => {
	const { data } = await axios.delete('/user/friend', {
		data: {
			senderId,
			receiverId,
		},
		withCredentials: true,
	});

	return data;
};
