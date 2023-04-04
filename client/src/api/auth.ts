import axios from 'axios';

import { User } from '../types';

export const isUser = (item: any): item is User => {
	return 'id' in item;
};

export const fetchUser = async (): Promise<User | null> => {
	const { data } = await axios.get<User | { status: 'ok' }>('/auth/refresh', {
		withCredentials: true,
	});

	if (!isUser(data)) {
		return null;
	}

	return data;
};

export const logInUser = async (email: string, password: string): Promise<User> => {
	const { data } = await axios.post<User>(
		'/auth/login',
		{
			email,
			password,
		},
		{ withCredentials: true }
	);

	return data;
};

export const registerUser = async (email: string, password: string, username: string): Promise<User> => {
	const { data } = await axios.post<User>(
		'/auth/register',
		{
			email,
			password,
			username,
		},
		{ withCredentials: true }
	);

	return data;
};

export const logOutUser = async () => {
	await axios.delete('/auth/logout', {
		withCredentials: true,
	});
};
