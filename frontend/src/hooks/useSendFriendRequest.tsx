import { Dispatch, SetStateAction } from 'react';
import { UseMutateFunction, useMutation } from '@tanstack/react-query';
import { fetchUserByUsername } from '../api/user';
import { AxiosError } from 'axios';

import { User } from '../types';

interface Props {
    createNotificationMutate: UseMutateFunction<
        User,
        unknown,
        {
            message: string;
            receiverId: string;
            senderId: string;
            link?: string | undefined;
        },
        unknown
    >;
    setMessage: Dispatch<SetStateAction<string>>;
    setError: Dispatch<SetStateAction<string>>;
    currentUserId: string;
}

const useSendFriendRequest = ({
    createNotificationMutate,
    setMessage,
    setError,
    currentUserId,
}: Props) => {
    const { mutate } = useMutation({
        mutationFn: ({ username }: { username: string }) => {
            return fetchUserByUsername(username);
        },
        onSuccess: async ({ data, status }) => {
            //if a receiver exists, create a notification for the receiver.
            if (data && status === 200) {
                createNotificationMutate({
                    receiverId: data.id,
                    message: `has sent you a friend request`,
                    senderId: currentUserId,
                });

                setMessage('Your request has been sent successfully!');
            }

            if (status === 202) {
                setError('You are already a friend of him/her');
            }

            if (status === 204) {
                setError("Couldn't find the user...");
            }
        },
        onError: (error: AxiosError | Error) => {
            console.log(error);
            setMessage('Something went wrong. please try again...');
        },
    });

    return { mutate };
};

export default useSendFriendRequest;
