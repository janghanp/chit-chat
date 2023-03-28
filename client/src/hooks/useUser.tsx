import { useQuery } from '@tanstack/react-query';
import { fetchUser } from '../api/user';

const useUser = () => {
	const { isLoading, isError, data } = useQuery(['currentUser'], { queryFn: () => fetchUser(), staleTime: Infinity });

	return { isLoading, isError, data };
};

export default useUser;
