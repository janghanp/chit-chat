import { Fragment, useEffect, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { useInView } from 'react-intersection-observer';

import { fetchMessages } from '../api/message';
import useUser from '../hooks/useUser';
import ChatMessage from './ChatMessage';
import NewMessageAlert from './NewMessageAlert';

const ChatBody = () => {
    const { chatId } = useParams();
    const { ref: firstMessageRef, inView: firstMessageInView } = useInView();
    const { ref: lastMessageRef, inView: lastMessageInView } = useInView();
    const { data: currentUser } = useUser();
    const firstPageMessagesRef = useRef<number>();
    const [hasNewMessage, setHasNewMessage] = useState<boolean>(false);
    const { data, fetchNextPage, hasNextPage, status } = useInfiniteQuery({
        queryKey: ['messages', chatId],
        queryFn: async ({ pageParam }) => fetchMessages(chatId as string, pageParam),
        getNextPageParam: (lastPage) => {
            if (lastPage.length < 10) {
                return undefined;
            }

            return lastPage[lastPage.length - 1].id;
        },
        // 1 min
        staleTime: 1000 * 60,
    });

    // Fetch more messages.
    useEffect(() => {
        if (firstMessageInView && hasNextPage) {
            fetchNextPage();
        }
    }, [firstMessageInView, hasNextPage, fetchNextPage]);

    // Show new message alert when getting a new message from other people and when it is not shoing the last message on the screen.
    useEffect(() => {
        if (
            data &&
            data.pages[0].length > 20 &&
            data.pages[0].length !== firstPageMessagesRef.current &&
            !lastMessageInView &&
            data.pages[0][0].senderId !== currentUser!.id
        ) {
            setHasNewMessage(true);
        }
    }, [lastMessageInView, data]);

    useEffect(() => {
        setHasNewMessage(false);
    }, [lastMessageInView]);

    useEffect(() => {
        if (data) {
            firstPageMessagesRef.current = data.pages[0].length;
        }
    }, [data]);

    const newMessageClickHandler = () => {
        setHasNewMessage(false);
        const chatBody = document.getElementById('chat-body')!;

        chatBody.scroll({ top: chatBody.scrollHeight, behavior: 'smooth' });
    };

    return (
        <div
            id="chat-body"
            data-cy="chat-body"
            className="flex h-full w-full flex-col-reverse gap-y-3 overflow-y-auto"
        >
            {status === 'loading' ? (
                <div></div>
            ) : (
                <Fragment>
                    {status === 'error' ? (
                        <div>Error...</div>
                    ) : (
                        <Fragment>
                            {data.pages!.map((page, indexP) => {
                                return (
                                    <Fragment key={indexP}>
                                        {page.map((message, index) => {
                                            return (
                                                <Fragment key={message.id}>
                                                    <ChatMessage
                                                        message={message}
                                                        isOwner={
                                                            message.sender.id === currentUser!.id
                                                        }
                                                        firstElementRef={
                                                            indexP === data.pages.length - 1 &&
                                                            index === page.length - 1
                                                                ? firstMessageRef
                                                                : undefined
                                                        }
                                                        lastElementRef={
                                                            indexP === 0 && index === 0
                                                                ? lastMessageRef
                                                                : undefined
                                                        }
                                                    />
                                                </Fragment>
                                            );
                                        })}
                                    </Fragment>
                                );
                            })}
                        </Fragment>
                    )}
                </Fragment>
            )}
            {hasNewMessage && (
                <>
                    <NewMessageAlert
                        newMessageClickHandler={newMessageClickHandler}
                        message={data!.pages[0][0]}
                    />
                </>
            )}
        </div>
    );
};

export default ChatBody;
