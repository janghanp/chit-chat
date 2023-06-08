import { useQuery } from '@tanstack/react-query';

import { fetchNotifications } from '../api/notification';

const useNotifications = (currentUserId: string) => {
    const { isLoading, isError, data } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => fetchNotifications(currentUserId),
    });

    return { isLoading, isError, data };
};

export default useNotifications;
