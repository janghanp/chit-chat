import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteFriend } from '../api/user';
import { socket } from '../socket';

const useRemoveFriend = (friend: any) => {
	const queryClient = useQueryClient();

	const { mutate } = useMutation({
		mutationFn: ({ senderId, receiverId }: { senderId: string; receiverId: string }) => {
			return deleteFriend(senderId, receiverId);
		},
		onSuccess: async (data, variables) => {
			const { senderId, receiverId } = variables;

			queryClient.setQueryData(['friends'], (old: any) => {
				return old.filter((el: any) => el.id !== friend.id);
			});

			socket.emit('remove_friend', { receiverId, senderId });
		},
		onError: (error: any) => {
			console.log(error);
		},
	});

	return { mutate };
};

export default useRemoveFriend;
