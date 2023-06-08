import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AxiosError, isAxiosError } from 'axios';

import { createChat } from '../api/chat';
import { Dispatch, SetStateAction } from 'react';

interface Props {
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    setError: Dispatch<SetStateAction<string>>;
    closeSidebar: () => void;
}

const useCreateChat = ({ setIsOpen, setError, closeSidebar }: Props) => {
    const navigate = useNavigate();

    const { mutate, isLoading } = useMutation({
        mutationFn: (formData: FormData) => {
            return createChat(formData);
        },
        onSuccess: (data) => {
            setIsOpen(false);

            if (closeSidebar) {
                closeSidebar();
            }

            navigate(`/chat/${data.id}`);
        },
        onError: (error: AxiosError | Error) => {
            if (isAxiosError(error)) {
                setError(error.response?.data.message);
            }
        },
    });
    return { mutate, isLoading };
};

export default useCreateChat;
