import { useMutation } from '@tanstack/react-query';
import { UseFormSetError } from 'react-hook-form';
import { AxiosError, isAxiosError } from 'axios';

import { updateUser } from '../api/user';
import { AuthErrorResponse } from '../types';

interface FormData {
    email: string;
    newPassword: string;
    confirmNewPassword: string;
    username: string;
}

const useUpdateUser = (setError: UseFormSetError<FormData>) => {
    const { mutate } = useMutation({
        mutationFn: (dataToUpdate: { newPassword?: string; username?: string }) => {
            return updateUser(dataToUpdate);
        },
        onSuccess: () => {
            window.location.href = '/';
        },
        onError: (error: AxiosError | Error) => {
            if (isAxiosError(error) && error.response?.status === 400) {
                // Set an error into username field.
                const serverError = error.response.data as AuthErrorResponse;

                setError('username', {
                    type: 'taken',
                    message: serverError.message,
                });
            } else if (error instanceof Error) {
                console.log(error);
            }
        },
    });

    return { mutate };
};

export default useUpdateUser;
