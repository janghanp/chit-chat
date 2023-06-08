import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Notification as NotificationType } from '../types';
import { readNotification } from '../api/notification';

const useReadNotification = () => {
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: async ({ notificationId }: { notificationId: string }) =>
            readNotification(notificationId),
        onSuccess: (data, variables) => {
            const { notificationId } = variables;
            queryClient.setQueryData<NotificationType[]>(['notifications'], (old) => {
                if (old) {
                    const newNotification = old.map((notification) => {
                        if (notification.id === notificationId) {
                            notification.read = true;
                            return { ...notification };
                        }
                        return notification;
                    });

                    return newNotification;
                }
            });
        },
        onError: (error) => {
            console.log(error);
        },
    });

    return { mutate };
};

export default useReadNotification;
