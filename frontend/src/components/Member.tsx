import { Dispatch, useState, SetStateAction } from 'react';

import { User } from '../types';
import defaultAvatar from '/default.jpg';
import useUser from '../hooks/useUser';
import useCreateNotification from '../hooks/useCreateNotification';
import useCreatePrivateChat from '../hooks/useCreatePrivateChat';
import useRemoveFriend from '../hooks/useRemoveFriend';
import useFriends from '../hooks/useFriends';

interface Props {
    member: User;
    setIsOpenMemberList: Dispatch<SetStateAction<boolean>>;
}

const Member = ({ member, setIsOpenMemberList }: Props) => {
    const { data: currentUser } = useUser();
    const { data: friends } = useFriends();
    const { mutate: createNotificationMutate } = useCreateNotification();
    const { mutate: createPrivateChatMutate } = useCreatePrivateChat();
    const { mutate: removeFriendMutate } = useRemoveFriend(member);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const createPrivateChatHandler = async () => {
        createPrivateChatMutate({
            senderId: currentUser!.id,
            receiverId: member.id,
        });
        setIsOpenMemberList(false);
    };

    const requestFriendHandler = async () => {
        createNotificationMutate({
            receiverId: member.id,
            message: `has sent you a friend request`,
            senderId: currentUser!.id,
        });
        setIsOpen(false);
    };

    const removeFriendHandler = () => {
        removeFriendMutate({
            senderId: currentUser!.id,
            receiverId: member.id,
        });
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <div
                className="flex flex-row items-center justify-start gap-x-3 rounded-md px-2 py-1.5 transition duration-200 hover:cursor-pointer hover:bg-base-300"
                onClick={currentUser?.id === member.id ? undefined : () => setIsOpen(!isOpen)}
            >
                <div className="avatar">
                    <div
                        className={`absolute -top-0.5 right-0 z-10 h-3 w-3 rounded-full border ${
                            member.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        } `}
                    ></div>
                    <div className="w-8 rounded-full">
                        <img src={member.avatar || defaultAvatar} alt="avatar" />
                    </div>
                </div>
                <span className="text-sm font-semibold">{member.username}</span>
            </div>
            {isOpen && (
                <>
                    <ul className="menu menu-compact absolute left-5 top-8 z-40 w-52 rounded-lg border bg-base-100 p-2 shadow sm:-left-[210px] sm:top-0">
                        <li onClick={createPrivateChatHandler}>
                            <span>private chat</span>
                        </li>
                        {friends && friends.map((friend) => friend.id).includes(member.id) ? (
                            <li onClick={removeFriendHandler}>
                                <span>Remove Friend</span>
                            </li>
                        ) : (
                            <li onClick={requestFriendHandler}>
                                <span>Add Friend</span>
                            </li>
                        )}
                    </ul>
                    <div onClick={() => setIsOpen(false)} className="fixed inset-0"></div>
                </>
            )}
        </div>
    );
};

export default Member;
