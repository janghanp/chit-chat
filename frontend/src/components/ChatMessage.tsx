import { memo } from 'react';
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
        <div
            ref={firstElementRef}
            key={message.id}
            className={`chat relative my-2 ${isOwner ? 'chat-end' : 'chat-start'}`}
        >
            <div className="chat-image avatar">
                <div className="w-10 rounded-full border">
                    <img
                        src={message.sender.avatar_url || defaultImageUrl}
                        alt={message.sender.username}
                    />
                </div>
            </div>
            <div className="chat-header text-sm">
                {message.sender.username}
                <time className="ml-2 text-xs opacity-50">
                    {format(new Date(message.createdAt), 'PP p')}
                </time>
            </div>
            <div className={`chat-bubble break-all ${message.id === 'temp' && 'text-gray-500'}`}>
                <div>{message.text || ''}</div>

                {message.attachments && message.attachments.length > 0 && (
                    <div className="flex gap-x-3">
                        {message.attachments.map((attachment) => {
                            return (
                                <div
                                    key={attachment.Key}
                                    className="overflow-hidden rounded-sm w-72 h-auto"
                                >
                                    <img
                                        className="object-contain w-full h-full"
                                        src={attachment.url}
                                        alt="attachment iamge"
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(ChatMessage);
