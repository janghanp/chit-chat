import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { UseFormSetError } from 'react-hook-form';
import { AxiosError, isAxiosError } from 'axios';

import { registerUser } from '../api/auth';
import { FormData, User } from '../types';

const useRegister = (setError: UseFormSetError<FormData>) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { mutate, isLoading } = useMutation({
        mutationFn: ({
            email,
            password,
            username,
        }: {
            email: string;
            password: string;
            username: string;
        }) => registerUser(email, password, username),
        async onSuccess() {
            await queryClient.invalidateQueries<User>(['currentUser']);
            navigate('/explorer');
        },
        onError(error: AxiosError | Error) {
            if (isAxiosError(error)) {
                if (error.response?.data.message.includes('email')) {
                    setError('email', {
                        type: 'taken',
                        message: error.response?.data.message,
                    });
                } else if (error.response?.data.message.includes('username')) {
                    setError('username', {
                        type: 'taken',
                        message: error.response?.data.message,
                    });
                }
            }
        },
    });

    return { mutate, isLoading };
};

export default useRegister;
