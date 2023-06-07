import { SetStateAction } from 'react';
import { useMutation } from '@tanstack/react-query';

import { updateChat } from '../api/chat';

const useUpdateChat = (setError: (value: SetStateAction<string>) => void) => {
	const { mutate, isLoading } = useMutation({
		mutationFn: (formData: FormData) => {
			return updateChat(formData);
		},
		onSuccess: () => {
			window.location.href = '/';
		},
		onError: (error: any) => {
			if (error.response.status === 400) {
				setError(error.response.data.message);
			}

			console.log(error);
		},
	});

	return { mutate, isLoading };
};

export default useUpdateChat;
