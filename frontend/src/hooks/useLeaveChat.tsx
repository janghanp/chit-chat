import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { leaveChat } from '../api/chat';
import { Chat } from '../types';
import { socket } from '../socket';

const useLeaveChat = (chatId: string, currentUserId: string) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationKey: ['leaveChat', chatId],
        mutationFn: ({ chatId, userId }: { chatId: string; userId: string }) => {
            return leaveChat(chatId, userId);
        },
        onSuccess: () => {
            queryClient.setQueryData<Chat[]>(['groupChatRooms'], (old) => {
                if (old) {
                    return old.filter((el) => el.id !== chatId);
                }
            });

            queryClient.setQueryData<Chat[]>(['privateChatRooms'], (old) => {
                if (old) {
                    return old.filter((el) => el.id !== chatId);
                }
            });

            queryClient.removeQueries({
                queryKey: ['chat', chatId],
                exact: true,
            });
            queryClient.removeQueries({
                queryKey: ['members', chatId],
                exact: true,
            });
            queryClient.removeQueries({
                queryKey: ['messages', chatId],
                exact: true,
            });

            socket.emit('leave_chat', { chatId, userId: currentUserId });

            navigate('/');
        },
        onError(error) {
            console.log(error);
        },
    });

    return { mutate };
};

export default useLeaveChat;
