import axios from 'axios';

import { User } from '../types';

export const fetchUser = async () => {
    const { data, status } = await axios.get<User>('/auth/refresh', {
        withCredentials: true,
    });

    if (status === 204) {
        return null;
    }

    return data;
};

export const loginUser = async (email: string, password: string) => {
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

export const registerUser = async (email: string, password: string, username: string) => {
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
    await axios.delete<'OK'>('/auth/logout', {
        withCredentials: true,
    });
};
