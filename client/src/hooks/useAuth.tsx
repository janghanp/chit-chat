import { useCallback } from 'react';
import axios from 'axios';

import { AuthErrorResponse, AuthSuccessResponse, AuthOk } from '../types';

export const isAuthSuccessResponse = (item: any): item is AuthSuccessResponse => {
	return 'id' in item;
};

export const isAuthErrorResponse = (item: any): item is AuthErrorResponse => {
	return 'message' in item;
};

const useAuth = () => {
	const register = useCallback(
		async (email: string, password: string, username: string): Promise<AuthErrorResponse | AuthSuccessResponse> => {
			let result = {} as AuthSuccessResponse | AuthErrorResponse;

			try {
				const { data } = await axios.post<AuthSuccessResponse>(
					'http://localhost:8080/auth/register',
					{
						email,
						password,
						username,
					},
					{ withCredentials: true }
				);

				result = data;
			} catch (error) {
				if (axios.isAxiosError(error)) {
					result = error.response!.data as AuthErrorResponse;
				} else if (error instanceof Error) {
					console.log(error);
				}
			}

			return result;
		},
		[]
	);

	const login = useCallback(
		async (email: string, password: string): Promise<AuthErrorResponse | AuthSuccessResponse> => {
			let result = {} as AuthSuccessResponse | AuthErrorResponse;

			try {
				const { data } = await axios.post<AuthSuccessResponse>(
					'http://localhost:8080/auth/login',
					{
						email,
						password,
					},
					{ withCredentials: true }
				);

				result = data;
			} catch (error) {
				if (axios.isAxiosError(error)) {
					result = error.response!.data as AuthErrorResponse;
				} else if (error instanceof Error) {
					console.log(error);
				}
			}

			return result;
		},
		[]
	);

	const logout = useCallback(async () => {
		try {
			await axios.delete('http://localhost:8080/auth/logout', {
				withCredentials: true,
			});
		} catch (error) {
			console.log(error);
		}
	}, []);

	const refresh = useCallback(async (): Promise<AuthSuccessResponse | AuthOk | AuthErrorResponse> => {
		let result = {} as AuthSuccessResponse | AuthOk | AuthErrorResponse;

		try {
			const { data } = await axios.get<AuthSuccessResponse>('http://localhost:8080/auth/refresh', {
				withCredentials: true,
			});

			result = data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				result = error.response!.data as AuthErrorResponse;
			} else if (error instanceof Error) {
				console.log('??????????????');
				
				console.log(error);
			}
		}

		return result;
	}, []);

	return { register, login, logout, refresh };
};

export default useAuth;
