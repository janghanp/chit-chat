import { useQuery } from '@tanstack/react-query';

import { fetchGroupChatRooms } from '../api/chat';
import useUser from './useUser';

const useGroupChatRooms = () => {
	const { data: currentUser } = useUser();

	const { isLoading, isError, data } = useQuery({
		queryKey: ['groupChatRooms'],
		queryFn: async () => fetchGroupChatRooms(currentUser!.id),
		// 1 min
		staleTime: 1000 * 60,
		enabled: currentUser ? true : false,
	});

	return { isLoading, isError, data };
};

export default useGroupChatRooms;
