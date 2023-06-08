import { Fragment, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { useInView } from 'react-intersection-observer';

import { fetchMessages } from '../api/message';
import useUser from '../hooks/useUser';
import ChatMessage from './ChatMessage';

const ChatBody = () => {
    const { chatId } = useParams();
    const { ref, inView } = useInView();
    const { data: currentUser } = useUser();
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

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

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
                                                                ? ref
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
        </div>
    );
};

export default ChatBody;
