import { memo, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import produce from 'immer';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

import { Chat } from '../types';
import useUser from '../hooks/useUser';
import defaultAvatar from '/default.jpg';
import { socket } from '../socket';
import { useToggleSidebarContext } from '../context/toggleSidebarContext';

interface Props {
    privateChatRoom: Chat;
}

const PrivateChatRoom = ({ privateChatRoom }: Props) => {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: currentUser } = useUser();
    const [isNewMessage, setIsNewMessage] = useState<boolean>(false);
    const { toggleSidebar } = useToggleSidebarContext();

    useEffect(() => {
        socket.emit('check_online', {
            receiverId: privateChatRoom.users![0].id,
            chatId: privateChatRoom.id,
        });
    }, [privateChatRoom]);

    // Set new message indicator.
    useEffect(() => {
        if (!privateChatRoom.readBy.includes(currentUser!.id) && chatId !== privateChatRoom.id) {
            setIsNewMessage(true);
        }
    }, [privateChatRoom, currentUser, chatId]);

    // Mark as read.
    useEffect(() => {
        if (chatId === privateChatRoom.id) {
            axios.patch(
                '/chat/read',
                { chatId, userId: currentUser!.id },
                { withCredentials: true }
            );

            queryClient.setQueryData<Chat[]>(['privateChatRooms'], (old) => {
                return produce(old, (draftState: Chat[]) => {
                    draftState.forEach((chat: Chat) => {
                        if (chat.id === chatId) {
                            if (!chat.readBy.includes(currentUser!.id)) {
                                chat.readBy.push(currentUser!.id);
                            }
                        }
                    });
                });
            });

            setIsNewMessage(false);

            return () => {
                axios.patch(
                    '/chat/read',
                    { chatId, userId: currentUser!.id },
                    { withCredentials: true }
                );
            };
        }
    }, [chatId, queryClient, currentUser, privateChatRoom.id]);

    const clickHandler = async () => {
        toggleSidebar();
        navigate(`/chat/${privateChatRoom.id}`);
    };

    const hasMessage = privateChatRoom.messages!.length > 0 ? true : false;

    let isToday = true;

    if (hasMessage) {
        const gap =
            new Date().getTime() - new Date(privateChatRoom.messages![0].createdAt).getTime();
        // 86400000 = 24 hours
        isToday = gap < 86400000;
    }

    return (
        <tr
            className={`hover:cursor-pointer ${
                chatId === privateChatRoom.id ? 'active' : ''
            } w-full`}
            onClick={clickHandler}
            data-cy="chatRoom"
        >
            <th className="w-full rounded-lg border-none p-3 shadow-inherit transition duration-300 hover:bg-gray-100">
                <div className="flex w-full items-center justify-start gap-x-3">
                    <div className="indicator">
                        <span
                            className={`badge-primary badge badge-xs indicator-item right-1 top-1 ${
                                isNewMessage ? 'block' : 'hidden'
                            }`}
                        ></span>
                        <div className="avatar">
                            <div
                                className={`absolute bottom-0 right-0 z-10 h-3 w-3 rounded-full border ${
                                    privateChatRoom.isReceiverOnline
                                        ? 'bg-green-500'
                                        : 'bg-gray-400'
                                } `}
                            ></div>
                            <div className="w-10 rounded-full border">
                                <img
                                    src={privateChatRoom.users![0].avatar || defaultAvatar}
                                    alt="receiver"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex w-full flex-col">
                        <span className="flex w-full items-center justify-between font-semibold">
                            <span>{privateChatRoom.users![0].username}</span>
                            <span>
                                <time className="ml-2 text-xs opacity-50">
                                    {!hasMessage ? (
                                        ''
                                    ) : (
                                        <>
                                            {isToday && hasMessage ? (
                                                <>
                                                    {format(
                                                        new Date(
                                                            privateChatRoom.messages![0].createdAt
                                                        ),
                                                        'p'
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {format(
                                                        new Date(
                                                            privateChatRoom.messages![0].createdAt
                                                        ),
                                                        'MM/dd'
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}
                                </time>
                            </span>
                        </span>
                        <div className="max-w-[210px] overflow-x-hidden text-ellipsis text-sm font-normal">
                            {hasMessage && (
                                <span>
                                    {privateChatRoom.messages![0].sender.username}:{' '}
                                    {privateChatRoom.messages![0].text || 'image'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </th>
        </tr>
    );
};

export default memo(PrivateChatRoom);
