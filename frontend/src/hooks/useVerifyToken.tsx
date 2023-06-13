import { useQuery } from '@tanstack/react-query';

import { verifyToken } from '../api/auth';

const useVerifyToken = (token: string) => {
    const { isLoading, isError, data, isSuccess } = useQuery({
        queryKey: ['verify_token', token],
        queryFn: async () => verifyToken(token),
        retry: false,
    });

    return { isLoading, isError, data, isSuccess };
};

export default useVerifyToken;
