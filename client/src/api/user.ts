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
