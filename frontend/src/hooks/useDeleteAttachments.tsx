import { Dispatch, SetStateAction } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { deleteAttachments } from '../api/chat';
import { Attachment } from '../types';

interface Props {
    setAttachments: Dispatch<SetStateAction<Attachment[]>>;
    attachmentId: string;
}

const useDeleteAttachments = ({ setAttachments, attachmentId }: Props) => {
    const { mutate } = useMutation({
        mutationFn: ({ chatId, Key }: { chatId: string; Key: string }) => {
            return deleteAttachments(chatId, Key);
        },
        onMutate() {
            setAttachments((prev) => {
                return prev.filter((el) => el.id !== attachmentId);
            });
        },
        onSuccess: (data) => {
            console.log(data);
        },
        onError: (error: AxiosError | Error) => {
            console.log(error);
        },
    });

    return { mutate };
};

export default useDeleteAttachments;
