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
		<div id="chat-body" data-cy="chat-body" className="flex h-full w-full flex-col-reverse gap-y-3 overflow-y-auto">
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
												<div
													ref={indexP === data.pages.length - 1 && index === page.length - 1 ? ref : undefined}
													key={message.id}
													className={`chat relative ${
														message.sender.id === currentUser!.id ? 'chat-end' : 'chat-start'
													}`}
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
													{message.text ? (
														<div className={`chat-bubble break-all ${message.id === 'temp' && 'text-gray-500'}`}>
															{message.text}
														</div>
													) : (
														<></>
														// <div className=""></div>
													)}
													{message.attachments.length > 0 && (
														<div className="chat-end mt-3 flex flex-row-reverse flex-wrap gap-3">
															{message.attachments.map((attachment) => {
																return (
																	<div
																		key={attachment.public_id}
																		className="bg-base-100 right-0 h-56 w-56 rounded-md border p-3 shadow-md"
																	>
																		<img src={attachment.secure_url} alt="attachment iamge" width={250} height={250} />
																	</div>
																);
															})}
														</div>
													)}
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
