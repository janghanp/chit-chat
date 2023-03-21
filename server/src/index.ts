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
	username: string;
	socketIds: string[];
}

const usersWithSockets: UserWithSockets[] = [];

io.on('connect', (socket: Socket) => {
	console.log(`🔌 socket id: ${socket.id}`);

	const username = socket.handshake.query.username;

	//Control when there are multiple tabs
	const isExistent = usersWithSockets.map((el) => el.username).includes(username as string);

	if (!isExistent) {
		io.emit('online', { username });
	}

	// Add a user and socketId in the usersWIthSockets.
	const targetIndex = usersWithSockets.findIndex((userWithSockets) => userWithSockets.username === username);

	if (targetIndex >= 0) {
		// Whene there is an existing user.
		usersWithSockets[targetIndex].socketIds.push(socket.id);
	} else {
		// A new user connection established.
		usersWithSockets.push({
			username: username as string,
			socketIds: [socket.id],
		});
	}

	console.log(usersWithSockets);

	socket.on('join_all_chats', (data: { chatIds: string[] }) => {
		const { chatIds } = data;

		socket.join(chatIds);
	});

	socket.on('join_chat', (data: { chatId: string; currentUser: CurrentUser; isNewMember: boolean }) => {
		const { chatId, currentUser, isNewMember } = data;

		socket.join(chatId);

		socket.emit('onlineUsers', { userNames: usersWithSockets.map((el) => el.username) });

		if (isNewMember) {
			socket.to(chatId).emit('enter_new_member', { newUser: currentUser, chatId });
		}
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

	socket.on('leave_chat', (data: { username: string; chatId: string }) => {
		const { username, chatId } = data;

		socket.to(chatId).emit('leave_member', { username: username, chatId });

		socket.leave(chatId);
	});

	socket.on('disconnect', () => {
		const username = socket.handshake.query.username;

		//Control when there are multiple tabs
		const socketLength = usersWithSockets.filter((el) => el.username === username)[0].socketIds.length;

		if (socketLength === 1) {
			io.emit('offline', { username });
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
		console.log('-------------------------------------------------------------');
		console.log('\n');
	});
});

const port = process.env.PORT || 8080;

server.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
