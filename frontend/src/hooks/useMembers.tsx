import { useQuery } from '@tanstack/react-query';

import { fetchMembers } from '../api/chat';

const useMembers = (chatId: string) => {
    const { isLoading, isError, data } = useQuery({
        queryKey: ['members', chatId],
        queryFn: async () => fetchMembers(chatId as string),
        enabled: chatId ? true : false,
    });

    return { isLoading, isError, data };
};

export default useMembers;
