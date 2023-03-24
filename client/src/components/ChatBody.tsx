import { memo, useEffect } from 'react';
import { format } from 'date-fns';

import defaultImageUrl from '/default.jpg';
import { useCurrentUserStore } from '../store';
import { useQuery } from '@tanstack/react-query';
import { fetchChat } from '../api/chat';
import { Message } from '../types';
import { useParams } from 'react-router';

const ChatBody = () => {
	const { chatId } = useParams();

	const currentUser = useCurrentUserStore((state) => state.currentUser);

	const { isLoading, isError, data } = useQuery({
		queryKey: ['chat', chatId],
		queryFn: async () => fetchChat(chatId as string, currentUser!.id),
		// 1 min
		staleTime: 1000 * 60,
	});

	useEffect(() => {
		const element = document.getElementById('chat-body');

		element!.scroll({ top: element!.scrollHeight, behavior: 'smooth' });
	}, [data]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (isError) {
		return <div>Error...</div>;
	}

	const messages = data.chat.messages as Message[];

	return (
		<div id="chat-body" className="absolute bottom-16 top-0 flex w-full flex-col gap-y-3 overflow-y-scroll px-5 py-5">
			{messages &&
				messages.map((msg) => {
					return (
						<div key={msg.id} className={`chat ${msg.sender.id === currentUser?.id ? 'chat-end' : 'chat-start'}`}>
							<div className="chat-image avatar">
								<div className="w-10 rounded-full border">
									<img src={msg.sender.avatar || defaultImageUrl} alt={msg.sender.username} />
								</div>
							</div>
							<div className="chat-header text-sm">
								{msg.sender.username}
								<time className="ml-2 text-xs opacity-50">{format(new Date(msg.createdAt), 'PP p')}</time>
							</div>
							<div className="chat-bubble break-words">{msg.text}</div>
						</div>
					);
				})}
		</div>
	);
};

export default memo(ChatBody);
