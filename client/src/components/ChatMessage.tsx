import { format } from 'date-fns';

import { Message } from '../types';
import defaultImageUrl from '/default.jpg';

interface Props {
	message: Message;
	isOwner: boolean;
	firstElementRef?: (node?: Element | null) => void;
}

const ChatMessage = ({ message, isOwner, firstElementRef }: Props) => {
	return (
		<div ref={firstElementRef} key={message.id} className={`chat relative my-2 ${isOwner ? 'chat-end' : 'chat-start'}`}>
			<div className="chat-image avatar">
				<div className="w-10 rounded-full border">
					<img src={message.sender.avatar || defaultImageUrl} alt={message.sender.username} />
				</div>
			</div>

			<div className="chat-header text-sm">
				{message.sender.username}
				<time className="ml-2 text-xs opacity-50">{format(new Date(message.createdAt), 'PP p')}</time>
			</div>

			{message.text && (
				<div className={`chat-bubble break-all ${message.id === 'temp' && 'text-gray-500'}`}>{message.text}</div>
			)}

			{message.attachments && message.attachments.length > 0 && (
				<div className={`chat-footer chat-end mt-3 flex flex-wrap gap-3 ${isOwner ? 'justify-end' : 'justify-start'}`}>
					{message.attachments.map((attachment) => {
						return (
							<div key={attachment.public_id} className="bg-base-100 right-0 h-56 w-56 rounded-md border p-3 shadow-md">
								<img src={attachment.secure_url} alt="attachment iamge" width={250} height={250} />
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default ChatMessage;
