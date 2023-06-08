import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { checkNotification } from '../api/user';
import { User } from '../types';

const useCheckNotification = () => {
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: async ({ userId }: { userId: string }) => checkNotification(userId),
        onSuccess: () => {
            queryClient.setQueryData<User>(['currentUser'], (old) => {
                if (old) {
                    return { ...old, hasNewNotification: false };
                }
            });
        },
        onError: (error: AxiosError | Error) => {
            console.log(error);
        },
    });

    return { mutate };
};

export default useCheckNotification;
