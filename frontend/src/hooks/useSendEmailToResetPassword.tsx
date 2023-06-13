import { Dispatch, SetStateAction } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError, isAxiosError } from 'axios';

import { sendEmailToResetPassword } from '../api/auth';

const useSendEmailToResetPassword = (setIsSent: Dispatch<SetStateAction<boolean>>) => {
    const { mutate, isLoading } = useMutation({
        mutationFn: (email: string) => {
            return sendEmailToResetPassword(email);
        },
        onSuccess: () => {
            setIsSent(true);
        },
        onError: (error: AxiosError | Error) => {
            if (isAxiosError(error)) {
                console.log(error);
            }
        },
    });

    return { mutate, isLoading };
};

export default useSendEmailToResetPassword;
