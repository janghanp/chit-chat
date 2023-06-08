import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { UseFormSetError } from 'react-hook-form';

import { loginUser } from '../api/auth';
import { User } from '../types';
import { AxiosError, isAxiosError } from 'axios';

interface FormData {
    email: string;
    password: string;
}

const useLogin = (setError: UseFormSetError<FormData>) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { mutate, isLoading } = useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) =>
            loginUser(email, password),
        async onSuccess() {
            await queryClient.invalidateQueries<User>(['currentUser']);
            navigate('/explorer');
        },
        onError(error: AxiosError | Error) {
            if (isAxiosError(error)) {
                setError('email', {
                    type: 'incorrect',
                    message: error.response?.data.message,
                });
                setError('password', {
                    type: 'incorrect',
                    message: error.response?.data.message,
                });
            }
        },
    });

    return { mutate, isLoading };
};

export default useLogin;
