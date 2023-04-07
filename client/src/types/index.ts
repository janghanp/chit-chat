export interface User {
	id: string;
	username: string;
	email: string;
	avatar?: string;
	public_id?: string;
	isOnline?: boolean;
	hasNewNotification: boolean;
}

export interface Chat {
	id: string;
	name?: string;
	icon?: string;
	public_id?: string;
	type: 'GROUP' | 'PRIVATE';
	ownerId?: string;
	createdAt: string;
	readBy: string[];
	messages?: Message[];
}

export interface Message {
	id: string;
	text: string;
	senderId: string;
	chatId: string;
	sender: User;
	createdAt: string;
}

export interface Notification {
	id: string;
	message: string;
	read: boolean;
	receiverId: string;
	senderId: string;
	sender: { avatar: string; username: string };
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
	avatar: string;
	public_id: string;
	chats: Chat[];
}

export interface Friend {
	id: string;
	username: string;
	avatar?: string;
}

export interface AuthErrorResponse {
	message: string;
}

export interface AxiosResponseWithUsername {
	username: string;
}
