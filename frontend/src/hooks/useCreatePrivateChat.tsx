import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { createPrivateChat } from '../api/chat';
import { Chat, isPreviousChat } from '../types';

const useCreatePrivateChat = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: ({ senderId, receiverId }: { senderId: string; receiverId: string }) => {
            return createPrivateChat(senderId, receiverId);
        },
        onSuccess: async (data) => {
            if (isPreviousChat(data)) {
                navigate(`/chat/${data.previousChat.id}`);
                return;
            }

            console.log(data);
            queryClient.setQueryData<Chat[]>(['privateChatRooms'], (old) => {
                if (old) {
                    return [...old, data];
                }
            });

            navigate(`/chat/${data.id}`);
            return;
        },
        onError: (error) => {
            console.log(error);
        },
    });

    return { mutate };
};

export default useCreatePrivateChat;
