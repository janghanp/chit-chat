import axios from 'axios';

import { AxiosResponseWithUsername, Friend, User } from '../types';

export const acceptFriendRequest = async (senderId: string, receiverId: string) => {
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
    const { data } = await axios.patch<'OK'>(
        '/user/notification',
        { userId },
        { withCredentials: true }
    );

    return data;
};

export const fetchFriends = async () => {
    const { data } = await axios.get<Friend>('/user/friends', {
        withCredentials: true,
    });

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

export const fetchUserByUsername = async (username: string) => {
    const { data, status } = await axios.get<User>('/user/username', {
        params: {
            username,
        },
        withCredentials: true,
    });

    return { data, status };
};

export const updateUser = async (dataToUpdate: { newPassword?: string; username?: string }) => {
    const { data } = await axios.patch<AxiosResponseWithUsername>('/user', dataToUpdate, {
        withCredentials: true,
    });

    return data;
};

export const uploadAvatar = async (formData: FormData) => {
    const { data } = await axios.post<User>('/user/avatar', formData, {
        withCredentials: true,
    });

    return data;
};
