import axios from 'axios';

import { AttachmentInfo, Message } from '../types';

export const createMessage = async (
    chatId: string,
    text: string,
    senderId: string,
    attachments: AttachmentInfo[]
) => {
    const { data } = await axios.post<Message>(
        '/message',
        { chatId, text, senderId, attachments },
        { withCredentials: true }
    );

    return data;
};

export const fetchMessages = async (chatId: string, lastMessageId: string | undefined) => {
    const { data } = await axios.get<Message[]>('/message', {
        params: {
            chatId,
            lastMessageId,
        },
        withCredentials: true,
    });

    return data;
};
