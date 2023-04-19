import { FormEvent, useEffect, useRef, useState } from 'react';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import Emoji from './Emoji';
import produce from 'immer';

import { createMessage } from '../api/message';
import { socket } from '../socket';
import { ChatWithIsNewMember, Message, User } from '../types';

interface Props {
	currentUser: User;
	currentChat: ChatWithIsNewMember;
}

const MessageInputBox = ({ currentChat, currentUser }: Props) => {
	const queryClient = useQueryClient();
	const [inputMessage, setInputMessage] = useState<string>('');
	const inputRef = useRef<HTMLInputElement>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const { mutate: createMessageMutate, isLoading } = useMutation({
		mutationKey: ['createMessage', currentChat.chat.id],
		mutationFn: ({
			chatId,
			inputMessage,
			currentUserId,
		}: {
			chatId: string;
			inputMessage: string;
			currentUserId: string;
		}) => {
			return createMessage(chatId, inputMessage, currentUserId);
		},
		onMutate: (data: { chatId: string; inputMessage: string; currentUserId: string }) => {
			const { chatId, inputMessage } = data;
			// Optimistice update for messages.
			const previousMessages = queryClient.getQueryData<InfiniteData<Message[]>>(['messages', chatId]);

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
						});
					});
				}
			});

			return { previousMessages };
		},
		onSuccess: (data, variables) => {
			// Group chat message
			if (currentChat!.chat.type === 'GROUP') {
				socket.emit('send_message', {
					messageId: data.id,
					text: variables.inputMessage,
					sender: currentUser,
					chatId: currentChat.chat.id,
					createdAt: data.createdAt,
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
				});
			}
		},
		onError(error, variables, context) {
			console.log(error);

			// Revert optimistic update.
			if (context) {
				queryClient.setQueryData(['messages', variables.chatId], context.previousMessages);
			}
		},
	});

	useEffect(() => {
		if (!isLoading) {
			inputRef.current?.focus();
		}
	}, [isLoading]);

	const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!inputMessage) {
			return;
		}

		createMessageMutate({ chatId: currentChat.chat.id, inputMessage, currentUserId: currentUser!.id });
		setInputMessage('');
	};

	return (
		<div className="absolute bottom-0 left-[2px] w-full bg-base-100 p-3">
			<form ref={formRef} onSubmit={submitHandler} className="relative flex gap-x-2">
				<input
					disabled={isLoading}
					data-cy="message-input"
					ref={inputRef}
					className="input-bordered input w-full disabled:bg-white"
					type="text"
					value={inputMessage}
					onChange={(e) => setInputMessage(e.target.value)}
				/>
				<Emoji setInputMessage={setInputMessage} inputRef={inputRef} />
				<button type="submit" className="btn" disabled={!inputMessage} data-cy="message-submit">
					Send
				</button>
			</form>
		</div>
	);
};

export default MessageInputBox;
