import { useMutation, useQueryClient } from '@tanstack/react-query';

import { logOutUser } from '../api/auth';
import { AxiosError, isAxiosError } from 'axios';

const useLogout = () => {
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: () => logOutUser(),
        onSuccess() {
            queryClient.removeQueries({ queryKey: ['currentUser'] });
            queryClient.removeQueries({ queryKey: ['groupChatRooms'] });
            queryClient.removeQueries({ queryKey: ['privateChatRooms'] });
            queryClient.removeQueries({ queryKey: ['chat'] });
            queryClient.removeQueries({ queryKey: ['messages'] });

            window.location.href = '/';
        },
        onError(error: AxiosError | Error) {
            if (isAxiosError(error)) {
                console.log(error.response?.data);
            }
        },
    });

    return { mutate };
};

export default useLogout;
