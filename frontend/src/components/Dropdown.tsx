import { Dispatch, SetStateAction, useState } from 'react';
import { HiOutlineTrash, HiOutlineArrowCircleRight } from 'react-icons/hi';
import { HiOutlineWrenchScrewdriver, HiOutlineEnvelope } from 'react-icons/hi2';

import useUser from '../hooks/useUser';
import ChatSettings from './ChatSettings';
import InviteFriends from './InviteFriends';
import useLeaveChat from '../hooks/useLeaveChat';
import useDeleteChat from '../hooks/useDeleteChat';

interface Props {
    setIsDropDownOpen: Dispatch<SetStateAction<boolean>>;
    isDropDownOpen: boolean;
    isOwner: boolean;
    chatId: string;
}

const Dropdown = ({ isDropDownOpen, setIsDropDownOpen, isOwner, chatId }: Props) => {
    const { data: currentUser } = useUser();
    const [isSettingOpen, setIsSettingOpen] = useState<boolean>(false);
    const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);
    const { mutate: leaveChatMutate } = useLeaveChat(chatId, currentUser!.id);
    const { mutate: deleteChatMutate } = useDeleteChat(chatId, currentUser!.id);

    const leaveChatHandler = async () => {
        const result = window.confirm('Are you sure you want to leave the chat?');

        if (result) {
            leaveChatMutate({ userId: currentUser!.id, chatId });
        }
    };

    const deleteChatHandler = async () => {
        const result = window.confirm('Are you sure you want to delete the chat?');

        if (result) {
            deleteChatMutate({ chatId });
        }
    };

    return (
        <>
            <div className="absolute right-0 top-10">
                {isDropDownOpen && (
                    <>
                        <ul
                            data-cy="dropdown-menu"
                            className="menu menu-compact bg-base-100 absolute right-0 z-30 w-52 rounded-md border p-2 shadow-md"
                        >
                            {isOwner && (
                                <>
                                    <li
                                        onClick={() => {
                                            setIsDropDownOpen(false);
                                            setIsInviteOpen(true);
                                        }}
                                    >
                                        <div className="flex w-full items-center justify-between">
                                            <span>Invite friends</span>
                                            <HiOutlineEnvelope />
                                        </div>
                                    </li>
                                    <li
                                        onClick={() => {
                                            setIsDropDownOpen(false);
                                            setIsSettingOpen(true);
                                        }}
                                    >
                                        <div className="flex w-full items-center justify-between">
                                            <span>Settings</span>
                                            <HiOutlineWrenchScrewdriver />
                                        </div>
                                    </li>
                                </>
                            )}
                            <li onClick={isOwner ? deleteChatHandler : leaveChatHandler}>
                                {isOwner ? (
                                    <div className="text-error flex items-center justify-between">
                                        <span>Delete Chat</span>
                                        <HiOutlineTrash />
                                    </div>
                                ) : (
                                    <div className="text-error flex items-center justify-between">
                                        <span>Leave Chat</span>
                                        <HiOutlineArrowCircleRight />
                                    </div>
                                )}
                            </li>
                        </ul>
                        <div
                            className="fixed inset-0 z-20"
                            onClick={() => setIsDropDownOpen(false)}
                        ></div>
                    </>
                )}
            </div>

            {isOwner && isSettingOpen && (
                <ChatSettings
                    chatId={chatId}
                    currentUserId={currentUser!.id}
                    setIsSettingOpen={setIsSettingOpen}
                />
            )}

            {isOwner && isInviteOpen && (
                <InviteFriends chatId={chatId} setIsInviteOpen={setIsInviteOpen} />
            )}
        </>
    );
};

export default Dropdown;
