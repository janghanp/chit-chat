import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AxiosError, isAxiosError } from 'axios';

import { changePassword } from '../api/auth';
import toast from 'react-hot-toast';

const useChangePassword = () => {
    const navigate = useNavigate();
    const { mutate, isLoading } = useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) => {
            return changePassword(email, password);
        },
        onSuccess: () => {
            navigate('/login');
            toast.success('New password set Successfully!');
        },
        onError: (error: AxiosError | Error) => {
            if (isAxiosError(error)) {
                console.log(error);
            }
        },
    });

    return { mutate, isLoading };
};

export default useChangePassword;
