import { useQuery } from '@tanstack/react-query';

import { fetchUser } from '../api/auth';

const useUser = () => {
    const { isLoading, isError, data } = useQuery({
        queryKey: ['currentUser'],
        queryFn: () => fetchUser(),
        staleTime: Infinity,
    });

    return { isLoading, isError, data };
};

export default useUser;
