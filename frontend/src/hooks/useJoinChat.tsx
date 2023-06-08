import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';

import { joinChat } from '../api/chat';

const useJoinChat = () => {
    const navigate = useNavigate();

    const { mutate } = useMutation({
        mutationFn: ({ chatName }: { chatName: string }) => {
            return joinChat(chatName);
        },
        onSuccess: (data) => {
            navigate(`/chat/${data.id}`);
        },
        onError: (error: AxiosError | Error) => {
            console.log(error);
        },
    });

    return { mutate };
};

export default useJoinChat;
