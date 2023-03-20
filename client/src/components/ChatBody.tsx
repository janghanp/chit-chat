import { memo, useEffect } from 'react';
import { format } from 'date-fns';

import defaultImageUrl from '/default.jpg';
import { Message } from '../types';
import { useUser } from '../context/UserContext';

interface Props {
	messages: Message[];
}
const ChatBody = ({ messages }: Props) => {
	const { currentUser } = useUser();

	useEffect(() => {
		const element = document.getElementById('chat-body');

		element!.scroll({ top: element!.scrollHeight, behavior: 'smooth' });
	}, [messages]);

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
