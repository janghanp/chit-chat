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

import { PrismaClient, User } from '@prisma/client';
import { checkToken } from './middleware/auth';
import authRoute from './routes/authRoute';
import userRoute from './routes/userRoute';
import chatRoute from './routes/chatRoute';

interface Room {
	username: string;
	chatId: string;
}

interface Message {
	senderId: string;
	chatId: string;
	senderName: string;
	text: string;
}

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

const prisma = new PrismaClient();

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
app.use('/user', userRoute);
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

	socket.on('join_room', async (data: { chatId: string; currentUser: CurrentUser; isNewMember: boolean }) => {
		const { chatId, currentUser, isNewMember } = data;

		socket.join(chatId);

		socket.emit('onlineUsers', { userNames: usersWithSockets.map((el) => el.username) });

		if (isNewMember) {
			socket.to(chatId).emit('enter_new_member', { newUser: currentUser });
		}
	});

	socket.on('send_message', async (data: Message) => {
		try {
			const { text, senderId, senderName, chatId } = data;

			const message = await prisma.message.create({
				data: {
					chatId,
					text,
					senderId,
				},
			});

			const chat = await prisma.chat.update({
				where: {
					id: chatId,
				},
				data: {
					messages: {
						connect: {
							id: message.id,
						},
					},
				},
			});

			io.to(chat.id).emit('receive_message', {
				id: message.id,
				text: message.text,
				senderId,
				senderName,
				createdAt: message.createdAt,
			});
		} catch (error) {
			console.log(error);
		}
	});

	socket.on('move_room', (data: { chatId: string }) => {
		socket.leave(data.chatId);
	});

	socket.on('leave_room', async (data: Room) => {
		try {
			const chat = await prisma.chat.update({
				where: {
					id: data.chatId,
				},
				data: {
					users: {
						disconnect: {
							username: data.username,
						},
					},
				},
				include: {
					users: true,
				},
			});

			if (chat.users.length === 0) {
				// Delete a chat when there is no user left in the chat.
				await prisma.chat.delete({
					where: {
						id: data.chatId,
					},
				});
			}

			socket.to(data.chatId).emit('leave_member', { username: data.username });

			socket.leave(data.chatId);
		} catch (error) {
			console.log(error);
		}
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
