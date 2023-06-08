import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { logOutUser } from '../api/auth';

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
            console.log(error);
        },
    });

    return { mutate };
};

export default useLogout;
