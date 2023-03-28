import { useQuery } from '@tanstack/react-query';

import { fetchChatRooms } from '../api/chat';
import useUser from './useUser';

const useChatRooms = () => {
	const { data: currentUser } = useUser();

	const { isLoading, isError, data } = useQuery({
		queryKey: ['chatRooms'],
		queryFn: async () => fetchChatRooms(currentUser!.id),
		// 1 min
		staleTime: 1000 * 60,
		enabled: currentUser ? true : false,
	});

	return { isLoading, isError, data };
};

export default useChatRooms;
