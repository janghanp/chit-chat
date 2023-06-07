import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { deleteChat } from '../api/chat';
import { Chat } from '../types';
import { socket } from '../socket';

const useDeleteChat = (chatId: string, currentUserId: string) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { mutate } = useMutation({
		mutationKey: ['deleteChat', chatId],
		mutationFn: ({ chatId }: { chatId: string }) => {
			return deleteChat(chatId);
		},
		onSuccess: () => {
			queryClient.setQueriesData<Chat[]>(['groupChatRooms', currentUserId], (old) => {
				if (old) {
					return old.filter((el) => el.id !== chatId);
				}
			});

			queryClient.setQueriesData<Chat[]>(['privateChatRooms', currentUserId], (old) => {
				if (old) {
					return old.filter((el) => el.id !== chatId);
				}
			});

			socket.emit('delete_chat', { chatId });

			navigate('/');
		},
		onError(error) {
			console.log(error);
		},
	});

	return { mutate };
};

export default useDeleteChat;
