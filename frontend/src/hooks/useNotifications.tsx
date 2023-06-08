import { useQuery } from '@tanstack/react-query';

import { fetchNotifications } from '../api/notification';

const useNotifications = () => {
    const { isLoading, isError, data } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => fetchNotifications(),
    });

    return { isLoading, isError, data };
};

export default useNotifications;
