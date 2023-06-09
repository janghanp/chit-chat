import { Dispatch, Fragment, SetStateAction } from 'react';

import useFriends from '../hooks/useFriends';
import useMembers from '../hooks/useMembers';
import { Friend as FriendType } from '../types';
import Friend from './Friend';

interface Props {
    setIsInviteOpen: Dispatch<SetStateAction<boolean>>;
    chatId: string;
}

const InviteFriends = ({ setIsInviteOpen, chatId }: Props) => {
    const { isLoading: isFriendsLoading, data: friends } = useFriends();
    const { isLoading: isMembersLoading, data: members } = useMembers(chatId);

    const closeModal = () => {
        setIsInviteOpen(false);
    };

    if (isFriendsLoading || isMembersLoading) {
        return <div></div>;
    }

    const memberIds = members?.map((member) => member.id);

    const friendsNotInTheChat = friends?.filter((friend) => !memberIds?.includes(friend.id));

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="fixed inset-0 z-30 bg-gray-400/50" onClick={closeModal}></div>
            <div className="relative z-30 w-full max-w-lg rounded-md border bg-white p-5 shadow-lg">
                <div className="mb-5 text-2xl font-bold">Invite Friends</div>
                <div className="w-full">
                    <div className="w-full">
                        {friendsNotInTheChat &&
                            friendsNotInTheChat.map((friend: FriendType) => {
                                return (
                                    <Fragment key={friend.id}>
                                        <Friend friend={friend} isInviting={true} />
                                    </Fragment>
                                );
                            })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InviteFriends;
