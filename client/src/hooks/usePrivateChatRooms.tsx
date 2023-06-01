import { useQuery } from '@tanstack/react-query';

import { fetchPrivateChatRooms } from '../api/chat';
import useUser from './useUser';

const usePrivateChatRooms = () => {
	const { data: currentUser } = useUser();

	const { isLoading, isError, data } = useQuery({
		queryKey: ['privatChatRooms'],
		queryFn: async () => fetchPrivateChatRooms(currentUser!.id),
		// 1 min
		staleTime: 1000 * 60,
		enabled: currentUser ? true : false,
	});

	return { isLoading, isError, data };
};

export default usePrivateChatRooms;
