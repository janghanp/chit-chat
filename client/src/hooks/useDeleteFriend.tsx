import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteFriend } from '../api/user';

const useDeleteFriend = (friend: any) => {
	const queryClient = useQueryClient();

	const { mutate } = useMutation({
		mutationFn: ({ senderId, receiverId }: { senderId: string; receiverId: string }) => {
			return deleteFriend(senderId, receiverId);
		},
		onSuccess: async (data) => {
			//upcate cache
			queryClient.setQueryData(['friends'], (old: any) => {
				return old.filter((el: any) => el.id !== friend.id);
			});
		},
		onError: (error: any) => {
			console.log(error);
		},
	});

	return { mutate };
};

export default useDeleteFriend;
