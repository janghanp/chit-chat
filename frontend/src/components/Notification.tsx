import { Dispatch, SetStateAction, memo, MouseEvent } from 'react';
import { formatDistance, subDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';

import { Notification as NotificationType } from '../types';
import defaultAvatar from '/default.jpg';
import useCreateNotification from '../hooks/useCreateNotification';
import useAccpetFriendRequest from '../hooks/useAccpetFriendRequest';
import useUser from '../hooks/useUser';
import useDeleteNotification from '../hooks/useDeleteNotification';
import { socket } from '../socket';
import useReadNotification from '../hooks/useReadNotification';

interface Props {
    notification: NotificationType;
    setIsOepn: Dispatch<SetStateAction<boolean>>;
}

const Notification = ({ notification, setIsOepn }: Props) => {
    const navigate = useNavigate();
    const { data: currentUser } = useUser();
    const { mutate: createNotificationMutate } = useCreateNotification();
    const { mutate: acceptFriendRequestMutate } = useAccpetFriendRequest();
    const { mutate: deleteNotificationMutate } = useDeleteNotification();
    const { mutate: readNotificationMutate } = useReadNotification();

    const acceptFriendRequestHandler = (
        e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
    ) => {
        e.stopPropagation();

        deleteNotificationMutate({ notificationId: notification.id });
        acceptFriendRequestMutate({
            receiverId: currentUser!.id,
            senderId: notification.senderId,
            notification,
        });

        createNotificationMutate({
            senderId: currentUser!.id,
            receiverId: notification.senderId,
            message: 'has accepted your friend request',
        });

        socket.emit('accept_friend', {
            id: currentUser!.id,
            avatar_url: currentUser!.avatar_url,
            username: currentUser!.username,
            receiverId: notification.senderId,
        });
    };

    const joinChat = () => {
        if (notification.link) {
            navigate(notification.link);
            deleteNotificationMutate({ notificationId: notification.id });
            setIsOepn(false);
        }
    };

    const ignoreRequest = () => {
        deleteNotificationMutate({ notificationId: notification.id });
    };

    const readNotificationHandler = () => {
        if (!notification.read) {
            readNotificationMutate({ notificationId: notification.id });
        }
    };

    return (
        <div
            key={notification.id}
            className="flex items-start gap-x-2 border-b p-2 transition duration-300 hover:cursor-pointer hover:bg-gray-200/50"
            onClick={readNotificationHandler}
        >
            <div className="avatar">
                <div className="w-10 rounded-full border">
                    <img src={notification.sender.avatar_url || defaultAvatar} alt={'?'} />
                </div>
            </div>
            <div className={`flex flex-col items-start ${notification.read && 'text-gray-400'}`}>
                <div>
                    {!notification.temp && (
                        <span className="mr-2 text-sm font-bold">
                            {notification.sender.username}
                        </span>
                    )}
                    <span className="text-sm">{notification.message}</span>
                </div>
                <span className="my-1 text-xs font-bold">
                    {formatDistance(subDays(new Date(notification.createdAt), 0), new Date(), {
                        addSuffix: true,
                    })}
                </span>
                {notification.message.includes('sent') && (
                    <div className="flex gap-x-2">
                        <button
                            className="btn-success btn-sm btn normal-case"
                            onClick={acceptFriendRequestHandler}
                        >
                            Accept
                        </button>
                        <button
                            className="btn-outline btn-ghost btn-sm btn normal-case"
                            onClick={ignoreRequest}
                        >
                            Ignore
                        </button>
                    </div>
                )}
                {notification.message.includes('invited') && (
                    <div className="flex gap-x-2">
                        <button className="btn-success btn-sm btn normal-case" onClick={joinChat}>
                            Join
                        </button>
                        <button
                            className="btn-outline btn-ghost btn-sm btn normal-case"
                            onClick={ignoreRequest}
                        >
                            Ignore
                        </button>
                    </div>
                )}
            </div>
            {!notification.read && (
                <div className="flex h-full flex-1 justify-center pt-5">
                    <span className="badge-success badge badge-xs indicator-item"></span>
                </div>
            )}
        </div>
    );
};

export default memo(Notification);
