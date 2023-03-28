import axios from 'axios';

import { User } from '../types';

export const isUser = (item: any): item is User => {
	return 'id' in item;
};

export const fetchUser = async (): Promise<User | null> => {
	const { data } = await axios.get<User | { status: 'ok' }>('http://localhost:8080/auth/refresh', {
		withCredentials: true,
	});

	if (!isUser(data)) {
		return null;
	}

	return data;
};

export const logInUser = async (email: string, password: string): Promise<User> => {
	const { data } = await axios.post<User>(
		'http://localhost:8080/auth/login',
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
		'http://localhost:8080/auth/register',
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
	await axios.delete('http://localhost:8080/auth/logout', {
		withCredentials: true,
	});
};
