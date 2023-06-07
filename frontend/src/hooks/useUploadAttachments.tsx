import { SetStateAction } from 'react';
import { useMutation } from '@tanstack/react-query';

import { uploadAttachments } from '../api/chat';
import { Attachment } from '../types';

const useUploadAttachments = (setAttachements: (value: SetStateAction<Attachment[]>) => void) => {
	const { mutate } = useMutation({
		mutationFn: ({ chatId, formData, id }: { id: string; chatId: string; formData: FormData }) => {
			return uploadAttachments(chatId, formData);
		},
		onMutate: (variables) => {
			setAttachements((prev) => {
				return prev.map((attachment) => {
					if (attachment.id === variables.id) {
						attachment.isUploading = true;
					}

					return attachment;
				});
			});
		},
		onSuccess: (data, variables) => {
			console.log(data);

			setAttachements((prev) => {
				return prev.map((attachment) => {
					if (attachment.id === variables.id) {
						attachment.public_id = data.public_id;
						attachment.secure_url = data.secure_url;
						attachment.isUploading = false;
					}

					return attachment;
				});
			});
		},
		onError: (error) => {
			console.log(error);
		},
	});

	return { mutate };
};

export default useUploadAttachments;
