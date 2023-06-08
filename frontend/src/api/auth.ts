import axios from 'axios';

import { User, isUser } from '../types';

export const fetchUser = async () => {
    const { data } = await axios.get<User | 'OK'>('/auth/refresh', {
        withCredentials: true,
    });

    if (!isUser(data)) {
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
