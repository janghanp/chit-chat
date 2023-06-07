import { useMutation } from '@tanstack/react-query';

import { createNotification } from '../api/notification';
import { socket } from '../socket';

const useCreateNotification = () => {
	const { mutate } = useMutation({
		mutationFn: ({
			message,
			receiverId,
			senderId,
			link,
		}: {
			message: string;
			receiverId: string;
			senderId: string;
			link?: string;
		}) => {
			return createNotification(message, receiverId, senderId, link);
		},
		onSuccess: async (data) => {
			if (!data) {
				return null;
			}

			socket.emit('send_notification', { ...data });
		},
		onError: (error) => {
			console.log(error);
		},
	});

	return { mutate };
};

export default useCreateNotification;
