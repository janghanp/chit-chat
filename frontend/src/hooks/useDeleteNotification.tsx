import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { Notification as NotificationType } from '../types';
import { deleteNotification } from '../api/notification';

const useDeleteNotification = () => {
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: async ({ notificationId }: { notificationId: string }) =>
            deleteNotification(notificationId),
        onSuccess: (data, variables) => {
            const { notificationId } = variables;

            queryClient.setQueryData<NotificationType[]>(['notifications'], (old) => {
                if (old) {
                    return old.filter((notificaion) => notificaion.id !== notificationId);
                }
            });
        },
        onError: (error: AxiosError | Error) => {
            console.log(error);
        },
    });

    return { mutate };
};

export default useDeleteNotification;
