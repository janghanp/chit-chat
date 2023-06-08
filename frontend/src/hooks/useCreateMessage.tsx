import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import produce from 'immer';
import { AxiosError } from 'axios';

import { AttachmentInfo, ChatWithIsNewMember, Message, User } from '../types';
import { createMessage } from '../api/message';
import { socket } from '../socket';

const useCreateMessage = (currentUser: User, currentChat: ChatWithIsNewMember) => {
    const queryClient = useQueryClient();

    const { mutate, isLoading } = useMutation({
        mutationKey: ['createMessage', currentChat.chat.id],
        mutationFn: ({
            chatId,
            inputMessage,
            currentUserId,
            attachments,
        }: {
            chatId: string;
            inputMessage: string;
            currentUserId: string;
            attachments: AttachmentInfo[];
        }) => {
            return createMessage(chatId, inputMessage, currentUserId, attachments);
        },
        onMutate: (data: { chatId: string; inputMessage: string; currentUserId: string }) => {
            const { chatId, inputMessage } = data;
            // Optimistice update for messages.
            const previousMessages = queryClient.getQueryData<InfiniteData<Message[]>>([
                'messages',
                chatId,
            ]);

            queryClient.setQueryData<InfiniteData<Message[]>>(['messages', chatId], (old) => {
                if (old) {
                    return produce(old, (draftState) => {
                        draftState.pages[0].unshift({
                            id: 'temp',
                            text: inputMessage,
                            sender: currentUser,
                            createdAt: new Date().toString(),
                            chatId,
                            senderId: currentUser.id,
                            attachments: [],
                        });
                    });
                }
            });

            return { previousMessages };
        },
        onSuccess: (data, variables) => {
            const { attachments } = variables;

            const chatBody = document.getElementById('chat-body');
            chatBody!.scrollTo(0, chatBody!.scrollHeight);

            // Group chat message
            if (currentChat!.chat.type === 'GROUP') {
                socket.emit('send_message', {
                    messageId: data.id,
                    text: variables.inputMessage,
                    sender: currentUser,
                    chatId: currentChat.chat.id,
                    createdAt: data.createdAt,
                    attachments,
                });
            }

            // Private chat message
            if (currentChat!.chat.type === 'PRIVATE') {
                socket.emit('private_message', {
                    messageId: data.id,
                    text: variables.inputMessage,
                    sender: currentUser,
                    chatId: currentChat.chat.id,
                    createdAt: data.createdAt,
                    attachments,
                });
            }
        },
        onError(error: AxiosError | Error, variables, context) {
            console.log(error);

            // Revert optimistic update.
            if (context) {
                queryClient.setQueryData(['messages', variables.chatId], context.previousMessages);
            }
        },
    });

    return { mutate, isLoading };
};

export default useCreateMessage;
