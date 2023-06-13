import axios from 'axios';

import { User } from '../types';

interface TokenType {
    email: string;
    username: string;
    id: string;
    iat: number;
    exp: number;
}

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

export const sendEmailToResetPassword = async (email: string) => {
    const { data } = await axios.post(
        '/auth/password_reset',
        {
            email,
        },
        { withCredentials: true }
    );

    return data;
};

export const verifyToken = async (token: string) => {
    const { data } = await axios.get<TokenType>('/auth/verify_token', {
        withCredentials: true,
        params: { token },
    });

    return data;
};

export const changePassword = async (email: string, password: string) => {
    const { data } = await axios.patch(
        '/auth/password',
        { email, password },
        { withCredentials: true }
    );

    console.log(data);

    return data;
};
