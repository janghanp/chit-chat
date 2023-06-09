export interface User {
    id: string;
    username: string;
    email: string;
    avatar_url?: string;
    Key?: string;
    isOnline?: boolean;
    hasNewNotification: boolean;
}

export interface ChatWithIsNewMember {
    chat: Chat;
    isNewMember: boolean;
}

export interface Chat {
    id: string;
    name?: string;
    icon_url?: string;
    Key?: string;
    type: 'GROUP' | 'PRIVATE';
    ownerId?: string;
    createdAt: string;
    readBy: string[];
    messages?: Message[];
    isReceiverOnline?: boolean;
    users?: { id: string; username: string; avatar_url?: string }[];
}

export interface PreviousChat {
    previousChat: Chat;
    isPrevious: boolean;
}

export interface Message {
    id: string;
    text?: string;
    senderId: string;
    chatId: string;
    sender: User;
    attachments?: AttachmentInfo[];
    createdAt: string;
}

export interface Notification {
    id: string;
    message: string;
    link?: string;
    read: boolean;
    receiverId: string;
    senderId: string;
    sender: { avatar_url?: string; username: string; id: string };
    createdAt: string;
    temp?: boolean;
}

export interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
}

export interface AuthOk {
    status: string;
}

export interface AuthSuccessResponse {
    id: string;
    email: string;
    username: string;
    avatar_url: string;
    Key: string;
    chats: Chat[];
}

export interface Friend {
    id: string;
    username: string;
    avatar_url?: string;
    isOnline?: boolean;
}

export interface Attachment {
    id: string;
    Key?: string;
    url?: string;
    preview?: string;
    isUploading: boolean;
}

export interface AttachmentInfo {
    Key: string;
    url: string;
}

export interface AuthErrorResponse {
    message: string;
}

export interface AxiosResponseWithUsername {
    username: string;
}
