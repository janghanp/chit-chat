import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteFriend } from '../api/user';
import { socket } from '../socket';
import { Friend } from '../types';

const useRemoveFriend = (friend: Friend) => {
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: ({ senderId, receiverId }: { senderId: string; receiverId: string }) => {
            return deleteFriend(senderId, receiverId);
        },
        onSuccess: async (data, variables) => {
            const { senderId, receiverId } = variables;

            queryClient.setQueryData<Friend[]>(['friends'], (old) => {
                if (old) {
                    return old.filter((el) => el.id !== friend.id);
                }
            });

            socket.emit('remove_friend', { receiverId, senderId });
        },
        onError: (error) => {
            console.log(error);
        },
    });

    return { mutate };
};

export default useRemoveFriend;
