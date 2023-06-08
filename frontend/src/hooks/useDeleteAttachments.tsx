import { Dispatch, SetStateAction } from 'react';
import { useMutation } from '@tanstack/react-query';

import { deleteAttachments } from '../api/chat';
import { Attachment } from '../types';

interface Props {
    setAttachments: Dispatch<SetStateAction<Attachment[]>>;
    attachmentId: string;
}

const useDeleteAttachments = ({ setAttachments, attachmentId }: Props) => {
    const { mutate } = useMutation({
        mutationFn: ({ chatId, public_id }: { chatId: string; public_id: string }) => {
            return deleteAttachments(chatId, public_id);
        },
        onMutate() {
            setAttachments((prev) => {
                return prev.filter((el) => el.id !== attachmentId);
            });
        },
        onSuccess: (data) => {
            console.log(data);
        },
        onError: (error) => {
            console.log(error);
        },
    });

    return { mutate };
};

export default useDeleteAttachments;
