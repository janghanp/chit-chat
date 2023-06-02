import { FormEvent, useEffect, useRef, useState } from 'react';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import Emoji from './Emoji';
import produce from 'immer';
import { HiOutlinePaperAirplane } from 'react-icons/hi';
import { HiDocumentPlus } from 'react-icons/hi2';
import { v4 as uuidv4 } from 'uuid';

import { createMessage } from '../api/message';
import { uploadAttachments } from '../api/chat';
import { socket } from '../socket';
import { Attachment, AttachmentInfo, ChatWithIsNewMember, Message, User } from '../types';
import AttachmentPreview from './AttachmentPreview';

interface Props {
	currentUser: User;
	currentChat: ChatWithIsNewMember;
}

const MessageInputBox = ({ currentChat, currentUser }: Props) => {
	const queryClient = useQueryClient();
	const [inputMessage, setInputMessage] = useState<string>('');
	const [imageError, setImageError] = useState<string>();
	const [attachments, setAttachements] = useState<Attachment[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const { mutate: createMessageMutate, isLoading } = useMutation({
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
		onError(error, variables, context) {
			console.log(error);

			// Revert optimistic update.
			if (context) {
				queryClient.setQueryData(['messages', variables.chatId], context.previousMessages);
			}
		},
	});
	const { mutate: uploadAttachmentsMutate } = useMutation({
		mutationFn: ({ chatId, formData, id }: { id: string; chatId: string; formData: FormData }) => {
			return uploadAttachments(chatId, formData);
		},
		onMutate: (variables) => {
			setAttachements((prev) => {
				return prev.map((attachment) => {
					if (attachment.id === variables.id) {
						attachment.isUploading = true;
					}

					return attachment;
				});
			});
		},
		onSuccess: (data, variables) => {
			console.log(data);

			setAttachements((prev) => {
				return prev.map((attachment) => {
					if (attachment.id === variables.id) {
						attachment.public_id = data.public_id;
						attachment.secure_url = data.secure_url;
						attachment.isUploading = false;
					}

					return attachment;
				});
			});
		},
		onError: (error) => {
			console.log(error);
		},
	});

	useEffect(() => {
		if (!isLoading) {
			inputRef.current?.focus();
		}
	}, [isLoading]);

	const uploadImage = (file: File) => {
		const reader = new FileReader();

		const id = uuidv4();

		reader.onloadend = () => {
			setAttachements((prev) => {
				prev.push({ id, preview: reader.result as string, isUploading: true });

				return [...prev];
			});
			setImageError('');
		};

		reader.readAsDataURL(file);

		const formData = new FormData();
		formData.append('file', file);

		uploadAttachmentsMutate({ id, chatId: currentChat.chat.id, formData });
	};

	const changeFileHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;

		if (files) {
			const fileListArray = Array.from(files);

			fileListArray.forEach((file) => {
				if (file.size > 5000000) {
					setImageError('The image should be less than 5MB.');
					return;
				}
			});

			fileListArray.forEach((file) => {
				uploadImage(file);
			});
		}
	};

	const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!inputMessage && attachments.length === 0) {
			return;
		}

		const newAttachments = attachments.map((attachment) => {
			const newAttachment = { public_id: '', secure_url: '' };

			newAttachment.public_id = attachment.public_id!;
			newAttachment.secure_url = attachment.secure_url!;

			return newAttachment;
		});

		createMessageMutate({
			chatId: currentChat.chat.id,
			inputMessage,
			currentUserId: currentUser!.id,
			attachments: newAttachments,
		});
		setInputMessage('');
		setAttachements([]);
	};

	const isAnythinUploading = attachments.some((attachment) => attachment.isUploading);

	return (
		<div className="bg-base-100 w-full">
			{imageError && <span className="text-error">{imageError}</span>}
			<input
				multiple
				type="file"
				ref={fileInputRef}
				accept="image/png, image/gif, image/jpeg, image/jpg, image/webp"
				className="hidden"
				onChange={changeFileHandler}
			/>
			{/* Preview */}
			{attachments.length > 0 && (
				<div className="relative mb-1 h-64 w-full overflow-x-auto rounded-md border p-3 shadow-lg">
					<div className="absolute flex h-auto w-auto gap-x-3">
						{attachments.map((attachment) => {
							return (
								<AttachmentPreview
									key={attachment.id}
									attachment={attachment}
									setAttachments={setAttachements}
									chatId={currentChat.chat.id}
								/>
							);
						})}
					</div>
				</div>
			)}
			<form ref={formRef} onSubmit={submitHandler} className="relative flex gap-x-2">
				<input
					disabled={isLoading}
					data-cy="message-input"
					ref={inputRef}
					className="w-full rounded-md border pl-5 pr-24 shadow-lg focus:outline-none disabled:bg-white"
					type="text"
					value={inputMessage}
					onChange={(e) => setInputMessage(e.target.value)}
				/>
				<div className="absolute right-20 flex h-full items-center justify-center gap-x-2">
					<button
						type="button"
						className="btn-ghost btn-sm btn-circle btn"
						onClick={() => fileInputRef.current?.click()}
					>
						<HiDocumentPlus className="text-2xl" />
					</button>
					<Emoji setInputMessage={setInputMessage} inputRef={inputRef} />
				</div>
				<button
					type="submit"
					className="btn"
					disabled={(!inputMessage && attachments.length === 0) || isAnythinUploading}
					data-cy="message-submit"
				>
					<HiOutlinePaperAirplane className="text-xl" />
				</button>
			</form>
		</div>
	);
};

export default MessageInputBox;
