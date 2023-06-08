import { useQuery } from '@tanstack/react-query';

import { fetchChat } from '../api/chat';

const useChat = (chatId: string, currentUserId: string) => {
    const { isLoading, isError, data, isSuccess } = useQuery({
        queryKey: ['chat', chatId],
        queryFn: async () => fetchChat(chatId),
        enabled: chatId && currentUserId ? true : false,
    });

    return { isLoading, isError, data, isSuccess };
};

export default useChat;
