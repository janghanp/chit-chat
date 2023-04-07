import { Fragment, useEffect } from 'react';
import { format } from 'date-fns';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { useInView } from 'react-intersection-observer';

import defaultImageUrl from '/default.jpg';
import { fetchMessages } from '../api/message';
import useUser from '../hooks/useUser';

const ChatBody = () => {
	const { chatId } = useParams();
	const { ref, inView } = useInView();
	const { data: currentUser } = useUser();
	const { data, fetchNextPage, hasNextPage, status } = useInfiniteQuery({
		queryKey: ['messages', chatId],
		queryFn: async ({ pageParam }) => fetchMessages(chatId as string, pageParam),
		getNextPageParam: (lastPage, pages) => {
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
			className="absolute bottom-20	top-0 flex w-full flex-col-reverse gap-y-3 overflow-y-auto px-5 py-5"
		>
			{status === 'loading' ? (
				<div>Loading...</div>
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
												<div
													ref={indexP === data.pages.length - 1 && index === page.length - 1 ? ref : undefined}
													key={message.id}
													className={`chat ${message.sender.id === currentUser!.id ? 'chat-end' : 'chat-start'}`}
												>
													<div className="chat-image avatar">
														<div className="w-10 rounded-full border">
															<img src={message.sender.avatar || defaultImageUrl} alt={message.sender.username} />
														</div>
													</div>
													<div className="chat-header text-sm">
														{message.sender.username}
														<time className="ml-2 text-xs opacity-50">
															{format(new Date(message.createdAt), 'PP p')}
														</time>
													</div>
													<div className="chat-bubble break-words">{message.text}</div>
												</div>
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
