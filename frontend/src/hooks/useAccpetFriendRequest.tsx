import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { acceptFriendRequest } from '../api/user';
import { Friend, Notification as NotificationType } from '../types';

const useAccpetFriendRequest = () => {
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: async ({
            receiverId,
            senderId,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            notification,
        }: {
            receiverId: string;
            senderId: string;
            notification: NotificationType;
        }) => acceptFriendRequest(senderId, receiverId),
        onSuccess: (data, variables) => {
            const { notification } = variables;

            queryClient.setQueryData<NotificationType[]>(['notifications'], (old) => {
                if (old) {
                    notification.message = `You accpeted ${notification.sender.username}' s friend request`;
                    notification.createdAt = new Date().toISOString();
                    notification.read = true;
                    notification.temp = true;

                    return [...old, notification];
                }
            });

            queryClient.setQueryData<Friend[]>(['friends'], (old) => {
                if (old) {
                    return [
                        ...old,
                        {
                            id: notification.senderId,
                            avatar: notification.sender.avatar,
                            username: notification.sender.username,
                        },
                    ];
                }
            });
        },
        onError: (error: AxiosError | Error) => {
            console.log(error);
        },
    });

    return { mutate };
};

export default useAccpetFriendRequest;
