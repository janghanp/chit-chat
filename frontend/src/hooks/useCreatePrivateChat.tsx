import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';

import { createPrivateChat } from '../api/chat';
import { Chat } from '../types';

const useCreatePrivateChat = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: ({ senderId, receiverId }: { senderId: string; receiverId: string }) => {
            return createPrivateChat(senderId, receiverId);
        },
        onSuccess: async (data) => {
            queryClient.setQueryData<Chat[]>(['privateChatRooms'], (old) => {
                if (old) {
                    const chat = old.find((chat) => chat.id === data.id);

                    if (!chat) {
                        return [...old, data];
                    }
                }
            });

            navigate(`/chat/${data.id}`);
            return;
        },
        onError: (error: AxiosError | Error) => {
            console.log(error);
        },
    });

    return { mutate };
};

export default useCreatePrivateChat;
