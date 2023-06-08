import * as dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import cloudinary from 'cloudinary';
import { PrismaClient } from '@prisma/client';

import { checkToken } from './middleware/auth';
import authRoute from './routes/authRoute';
import userRoute from './routes/userRoute';
import chatRoute from './routes/chatRoute';
import messageRoute from './routes/messageRoute';
import notificationRoute from './routes/notificationRoute';

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

interface AttachmentInfo {
    public_id: string;
    secure_url: string;
}

interface UserWithSockets {
    userId: string;
    socketIds: string[];
}

dotenv.config();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [
            'http://localhost:5173',
            'http://localhost:4173',
            'http://localhost',
            'https://www.chitchat.lat',
            'https://chitchat.lat',
        ],
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

app.use(morgan('dev'));
app.use(
    cors({
        origin: [
            'http://localhost:5173',
            'http://localhost:4173',
            'http://localhost',
            'https://www.chitchat.lat',
            'https://chitchat.lat',
        ],
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoute);
app.use('/api/user', checkToken, userRoute);
app.use('/api/chat', checkToken, chatRoute);
app.use('/api/message', checkToken, messageRoute);
app.use('/api/notification', checkToken, notificationRoute);

const onlineUsers: UserWithSockets[] = [];

io.on('connect', (socket: Socket) => {
    console.log(`🔌 socket id: ${socket.id}`);

    // Make another layer to get username.
    socket.on('user_connect', (data: { userId: string; chatIds: string[] }) => {
        const { userId, chatIds } = data;

        // For disconnecting.
        socket.handshake.query.userId = userId;

        //Control when there are multiple tabs
        const isExistent = onlineUsers.map((el) => el.userId).includes(userId as string);

        if (!isExistent) {
            io.emit('online', { userId });
        }

        // Add a user and socketId in onlineUsers.
        const targetIndex = onlineUsers.findIndex(
            (userWithSockets) => userWithSockets.userId === userId
        );

        if (targetIndex >= 0) {
            // Whene there is an existing user.
            onlineUsers[targetIndex].socketIds.push(socket.id);
        } else {
            // A new user's connection established.
            onlineUsers.push({
                userId: userId as string,
                socketIds: [socket.id],
            });
        }

        console.log(onlineUsers);

        socket.join(chatIds);
    });

    socket.on(
        'join_chat',
        (data: { chatId: string; currentUser: CurrentUser; isNewMember: boolean }) => {
            const { chatId, currentUser, isNewMember } = data;

            socket.join(chatId);

            if (isNewMember) {
                socket.to(chatId).emit('enter_new_member', { newUser: currentUser, chatId });
            }
        }
    );

    socket.on('fetch_members', () => {
        socket.emit('set_members_status', { userIds: onlineUsers.map((el) => el.userId) });
    });

    socket.on('check_online', (data: { receiverId: string; chatId: string }) => {
        const { receiverId, chatId } = data;

        const isOnline = onlineUsers.some((el) => el.userId === receiverId);

        socket.emit('is_online', { isOnline, chatId });
    });

    socket.on(
        'private_message',
        async (data: {
            chatId: string;
            messageId: string;
            text: string;
            sender: CurrentUser;
            createdAt: string;
            attachments: AttachmentInfo[];
        }) => {
            const { chatId, messageId, text, sender, createdAt, attachments } = data;

            // Find a receiverId
            const chat = await prisma.chat.findUnique({
                where: {
                    id: chatId,
                },
                select: {
                    users: {
                        where: {
                            NOT: {
                                id: sender.id,
                            },
                        },
                        select: {
                            id: true,
                        },
                    },
                },
            });

            const receiverId = chat?.users[0].id;

            const receiver = await prisma.user.findUnique({
                where: {
                    id: receiverId,
                },
            });

            // A receiver needs to connect the private chat room.
            await prisma.user.update({
                where: {
                    id: receiverId,
                },
                data: {
                    leftPrivateChatIds: {
                        set: receiver?.leftPrivateChatIds.filter((id) => id !== chatId),
                    },
                },
            });

            const target = onlineUsers.filter((el) => {
                return el.userId === receiverId;
            });

            // When a receiver has a socket connection.
            if (target.length > 0) {
                if (target[0].socketIds?.length > 0) {
                    //Connect a receiver's sockets to the chat so that the person can get message.
                    socket.to(target[0].socketIds).socketsJoin(chatId);
                }
            }

            io.to(chatId).emit('receive_message', {
                chatId,
                messageId,
                text,
                sender,
                createdAt,
                attachments,
                isPrivate: true,
            });
        }
    );

    socket.on(
        'send_message',
        async (data: {
            messageId: string;
            text: string;
            chatId: string;
            sender: CurrentUser;
            createdAt: string;
            attachments: AttachmentInfo[];
        }) => {
            const { messageId, text, sender, chatId, createdAt, attachments } = data;

            io.to(chatId).emit('receive_message', {
                chatId,
                messageId,
                text,
                sender,
                createdAt,
                attachments,
                isPrivate: false,
            });
        }
    );

    socket.on('leave_chat', async (data: { userId: string; chatId: string }) => {
        const { userId, chatId } = data;

        const chat = await prisma.chat.findUnique({
            where: {
                id: chatId,
            },
        });

        const isPrivate = chat?.type === 'PRIVATE' ? true : false;

        socket.to(chatId).emit('leave_member', { userId, chatId, isPrivate });

        socket.leave(chatId);
    });

    socket.on('delete_chat', (data: { chatId: string }) => {
        const { chatId } = data;

        io.to(chatId).emit('destroy_chat');

        socket.leave(chatId);
    });

    socket.on('send_notification', (data) => {
        const { receiverId } = data;

        const target = onlineUsers.filter((el) => {
            return el.userId === receiverId;
        });

        if (target.length > 0) {
            if (target[0].socketIds?.length > 0) {
                socket.to(target[0].socketIds).emit('receive_notification', { ...data });
            }
        }
    });

    socket.on(
        'accept_friend',
        (data: { id: string; avatar: string; username: string; receiverId: string }) => {
            const { id, avatar, username, receiverId } = data;

            const target = onlineUsers.filter((el) => {
                return el.userId === receiverId;
            });

            if (target.length > 0) {
                if (target[0].socketIds?.length > 0) {
                    socket.to(target[0].socketIds).emit('accept_friend', { id, avatar, username });
                }
            }
        }
    );

    socket.on('remove_friend', (data: { receiverId: string; senderId: string }) => {
        const { receiverId, senderId } = data;

        const target = onlineUsers.filter((el) => {
            return el.userId === receiverId;
        });

        if (target.length > 0) {
            if (target[0].socketIds?.length > 0) {
                socket.to(target[0].socketIds).emit('remove_friend', { senderId });
            }
        }
    });

    socket.on('disconnect', () => {
        const userId = socket.handshake.query.userId;

        //Control when there are multiple tabs
        if (userId) {
            const socketLength = onlineUsers.filter((el) => el.userId === userId)[0].socketIds
                .length;

            if (socketLength === 1) {
                io.emit('offline', { userId });
            }
        }

        // Remove the socketId from usersWithSocketIds array.
        for (const [index, userWithSockets] of onlineUsers.entries()) {
            const targetIndex = userWithSockets.socketIds.findIndex((socketId) => {
                return socketId === socket.id;
            });

            if (targetIndex >= 0) {
                userWithSockets.socketIds.splice(targetIndex, 1);

                if (userWithSockets.socketIds.length === 0) {
                    onlineUsers.splice(index, 1);
                }

                break;
            }
        }

        for (const room of socket.rooms) {
            socket.leave(room);
        }

        console.log(`👋 socket id: ${socket.id}`);
        console.log(onlineUsers);
        console.log('------------------------------------------------------------- \n');
    });
});

const port = process.env.PORT || 9000;

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
