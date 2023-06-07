import { FormEvent, useEffect, useRef, useState } from 'react';
import Emoji from './Emoji';
import { HiOutlinePaperAirplane } from 'react-icons/hi';
import { HiDocumentPlus } from 'react-icons/hi2';
import { v4 as uuidv4 } from 'uuid';

import { Attachment, ChatWithIsNewMember, User } from '../types';
import AttachmentPreview from './AttachmentPreview';
import useCreateMessage from '../hooks/useCreateMessage';
import useUploadAttachments from '../hooks/useUploadAttachments';

interface Props {
    currentUser: User;
    currentChat: ChatWithIsNewMember;
}

const MessageInputBox = ({ currentChat, currentUser }: Props) => {
    const [inputMessage, setInputMessage] = useState<string>('');
    const [imageError, setImageError] = useState<string>();
    const [attachments, setAttachements] = useState<Attachment[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const { mutate: createMessageMutate, isLoading } = useCreateMessage(currentUser, currentChat);
    const { mutate: uploadAttachmentsMutate } = useUploadAttachments(setAttachements);

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
                prev.push({
                    id,
                    preview: reader.result as string,
                    isUploading: true,
                });

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
