import { FormEvent, useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { createMessage } from '../api/message';
import { socket } from '../socket';
import { ChatWithIsNewMember, User } from '../types';

interface Props {
	currentUser: User;
	currentChat: ChatWithIsNewMember;
}

const MessageInputBox = ({ currentChat, currentUser }: Props) => {
	const [inputMessage, setInputMessage] = useState<string>('');
	const formRef = useRef<HTMLFormElement>(null);
	const { mutate: createMessageMutate } = useMutation({
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
		onSuccess: (data) => {
			// Group chat message
			if (currentChat!.chat.type === 'GROUP') {
				socket.emit('send_message', {
					messageId: data.id,
					text: inputMessage,
					sender: currentUser,
					chatId: currentChat.chat.id,
					createdAt: data.createdAt,
				});
			}

			// Private chat message
			if (currentChat!.chat.type === 'PRIVATE') {
				socket.emit('private_message', {
					messageId: data.id,
					text: inputMessage,
					sender: currentUser,
					chatId: currentChat.chat.id,
					createdAt: data.createdAt,
				});
			}

			setInputMessage('');
		},
		onError: (error: any) => {
			console.log(error);
		},
	});

	const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!inputMessage) {
			return;
		}

		createMessageMutate({ chatId: currentChat.chat.id, inputMessage, currentUserId: currentUser!.id });
	};

	return (
		<div className="absolute bottom-0 left-[2px] w-full bg-base-100 p-3">
			<form ref={formRef} onSubmit={submitHandler} className="flex gap-x-2">
				<input
					data-cy="message-input"
					className="input-bordered input w-full"
					type="text"
					value={inputMessage}
					onChange={(e) => setInputMessage(e.target.value)}
				/>
				<button className="btn" disabled={!inputMessage} data-cy="message-submit">
					Send
				</button>
			</form>
		</div>
	);
};

export default MessageInputBox;
