import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import morgan from 'morgan';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import cloudinary from 'cloudinary';
import { instrument } from '@socket.io/admin-ui';

import { checkToken } from './middleware/auth';
import authRoute from './routes/authRoute';
import userRoute from './routes/userRoute';
import chatRoute from './routes/chatRoute';

interface Chat {
	id: string;
	name: string;
	icon?: string;
	public_id?: string;
	ownerId: string;
}

interface CurrentUser {
	id: string;
	username: string;
	email: string;
	avatar?: string;
	public_id?: string;
	isOnline?: boolean;
	chats: Chat[];
}

// cloudinary picks up env and is now configured.
cloudinary.v2.config({ secure: true });

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		origin: ['http://localhost:5173', 'https://admin.socket.io'],
		methods: ['GET', 'POST'],
		credentials: true,
	},
});

instrument(io, {
	auth: false,
	mode: 'development',
});

app.use(morgan('dev'));
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoute);
app.use('/user', checkToken, userRoute);
app.use('/chat', checkToken, chatRoute);

interface UserWithSockets {
	userId: string;
	socketIds: string[];
}

const usersWithSockets: UserWithSockets[] = [];

io.on('connect', (socket: Socket) => {
	console.log(`🔌 socket id: ${socket.id}`);

	// Make another layer to get username.
	socket.on('user_connect', (data: { userId: string; chatIds: string[] }) => {
		const { userId, chatIds } = data;

		// For disconnecting.
		socket.handshake.query.userId = userId;

		//Control when there are multiple tabs
		const isExistent = usersWithSockets.map((el) => el.userId).includes(userId as string);

		if (!isExistent) {
			io.emit('online', { userId });
		}

		// Add a user and socketId in the usersWIthSockets.
		const targetIndex = usersWithSockets.findIndex((userWithSockets) => userWithSockets.userId === userId);

		if (targetIndex >= 0) {
			// Whene there is an existing user.
			usersWithSockets[targetIndex].socketIds.push(socket.id);
		} else {
			// A new user connection established.
			usersWithSockets.push({
				userId: userId as string,
				socketIds: [socket.id],
			});
		}

		console.log(usersWithSockets);

		socket.join(chatIds);
	});

	socket.on('join_chat', (data: { chatId: string; currentUser: CurrentUser; isNewMember: boolean }) => {
		const { chatId, currentUser, isNewMember } = data;

		socket.join(chatId);

		if (isNewMember) {
			socket.to(chatId).emit('enter_new_member', { newUser: currentUser, chatId });
		}
	});

	socket.on('fetch_members', () => {
		socket.emit('set_members_status', { userIds: usersWithSockets.map((el) => el.userId) });
	});

	socket.on(
		'send_message',
		async (data: { messageId: string; text: string; chatId: string; sender: CurrentUser; createdAt: string }) => {
			const { messageId, text, sender, chatId, createdAt } = data;

			io.to(chatId).emit('receive_message', {
				chatId,
				messageId,
				text,
				sender,
				createdAt,
			});
		}
	);

	socket.on('leave_chat', (data: { userId: string; chatId: string }) => {
		const { userId, chatId } = data;

		socket.to(chatId).emit('leave_member', { userId, chatId });

		socket.leave(chatId);
	});

	socket.on('delete_chat', (data: { chatId: string }) => {
		const { chatId } = data;

		io.to(chatId).emit('destroy_chat', { chatId });

		socket.leave(chatId);
	});

	socket.on('disconnect', () => {
		const userId = socket.handshake.query.userId;

		//Control when there are multiple tabs
		if (userId) {
			const socketLength = usersWithSockets.filter((el) => el.userId === userId)[0].socketIds.length;

			if (socketLength === 1) {
				io.emit('offline', { userId });
			}
		}

		// Remove the socketId from usersWithSocketIds array.
		for (const [index, userWithSockets] of usersWithSockets.entries()) {
			const targetIndex = userWithSockets.socketIds.findIndex((socketId) => {
				return socketId === socket.id;
			});

			if (targetIndex >= 0) {
				userWithSockets.socketIds.splice(targetIndex, 1);

				if (userWithSockets.socketIds.length === 0) {
					usersWithSockets.splice(index, 1);
				}

				break;
			}
		}

		for (const room of socket.rooms) {
			socket.leave(room);
		}

		console.log(`👋 socket id: ${socket.id}`);
		console.log(usersWithSockets);
		console.log('------------------------------------------------------------- \n');
	});
});

const port = process.env.PORT || 8080;

server.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
