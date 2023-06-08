import produce from 'immer';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Notification } from '../types';
import { readAllNotifications } from '../api/notification';

const useReadAllNotifications = () => {
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: async () => readAllNotifications(),
        onSuccess: () => {
            queryClient.setQueryData<Notification[]>(['notifications'], (old) => {
                if (old) {
                    return produce(old, (draftState) => {
                        draftState.forEach((notification) => {
                            notification.read = true;
                        });
                    });
                }
            });
        },
        onError: (error) => {
            console.log(error);
        },
    });

    return { mutate };
};

export default useReadAllNotifications;
