import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { createPrivateChat } from '../api/chat';

const useCreatePrivateChat = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { mutate } = useMutation({
		mutationFn: ({ senderId, receiverId }: { senderId: string; receiverId: string }) => {
			return createPrivateChat(senderId, receiverId);
		},
		onSuccess: async (data) => {
			if (!data.isPrevious) {
				queryClient.setQueryData(['chatRooms'], (old: any) => {
					return [...old, data];
				});

				navigate(`/chat/${data.id}`);
				return;
			}

			navigate(`/chat/${data.previousChat.id}`);
		},
		onError: (error: any) => {
			console.log(error);
		},
	});

	return { mutate };
};

export default useCreatePrivateChat;