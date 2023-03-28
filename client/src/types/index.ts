export interface User {
	id: string;
	username: string;
	email: string;
	avatar?: string;
	public_id?: string;
	isOnline?: boolean;
}

export interface Chat {
	id: string;
	name: string;
	icon?: string;
	public_id?: string;
	ownerId: string;
	messages?: Message[];
}

export interface Message {
	id: string;
	text: string;
	sender: User;
	createdAt: string;
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

export interface AuthErrorResponse {
	message: string;
}

export interface AxiosResponseWithUsername {
	username: string;
}
