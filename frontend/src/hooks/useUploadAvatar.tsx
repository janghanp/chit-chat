import { SetStateAction } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { uploadAvatar } from '../api/user';

const useUploadAvatar = (setIsUploading: (value: SetStateAction<boolean>) => void) => {
    const { mutate } = useMutation({
        mutationFn: (formData: FormData) => {
            return uploadAvatar(formData);
        },
        onSuccess: () => {
            setIsUploading(false);
            window.location.href = '/';
        },
        onError: (error: AxiosError | Error) => {
            console.log(error);
        },
    });

    return { mutate };
};

export default useUploadAvatar;
