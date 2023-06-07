import { useQuery } from '@tanstack/react-query';

import { fetchFriends } from '../api/user';

const useFriends = () => {
    const { isLoading, isError, data } = useQuery({
        queryKey: ['friends'],
        queryFn: async () => fetchFriends(),
    });

    return { isLoading, isError, data };
};

export default useFriends;
