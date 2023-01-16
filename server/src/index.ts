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

import { PrismaClient } from '@prisma/client';
import { checkToken } from './middleware/auth';
import authRoute from './routes/authRoute';
import userRoute from './routes/userRoute';
import chatRoute from './routes/chatRoute';

interface Room {
  username: string;
  roomName: string;
}

interface Message {
  senderId: string;
  roomName: string;
  senderName: string;
  text: string;
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

  socket.on('join_room', async (data: Room) => {
    const targetIndex = usersWithSockets.findIndex((userWithSockets) => userWithSockets.username === data.username);

    if (targetIndex >= 0) {
      // Whene there is an existing user.
      usersWithSockets[targetIndex].socketIds.push(socket.id);
    } else {
      // A new user connection established.
      usersWithSockets.push({
        username: data.username,
        socketIds: [socket.id],
      });
    }

    console.log(usersWithSockets);

    // Subscribe the socket channel
    socket.join(data.roomName);

    // Check if a user joined the room for the first time.
    const userInChat = await prisma.chat.findFirst({
      where: {
        AND: [
          {
            name: data.roomName,
          },
          {
            users: {
              some: {
                username: data.username,
              },
            },
          },
        ],
      },
    });

    // A new member to the room.
    if (!userInChat) {
      // Connect a user to the existing chat.
      await prisma.chat.update({
        where: {
          name: data.roomName,
        },
        data: {
          users: {
            connect: {
              username: data.username,
            },
          },
        },
      });

      const newUser = await prisma.user.findUnique({
        where: {
          username: data.username,
        },
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete newUser.password;

      io.to(data.roomName).emit('new_member', { newUser });
    }
  });

  socket.on('send_message', async (data: Message) => {
    const { text, senderId, senderName } = data;

    try {
      // Create Message
      const message = await prisma.message.create({
        data: {
          text,
          senderId,
        },
      });

      // Update Chat table by connecting a message to the chat table.
      const chat = await prisma.chat.update({
        where: {
          name: data.roomName,
        },
        data: {
          messages: {
            connect: {
              id: message.id,
            },
          },
        },
      });

      // Send back a message that was just created to a spefici chat room so that everyone in the chat room can see the message on the screen.
      io.to(chat.name).emit('receive_message', {
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

  socket.on('leave_room', async (data: Room) => {
    // Update Chat table by disconnecting a user from a chat.
    const chat = await prisma.chat.update({
      where: {
        name: data.roomName,
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
          name: data.roomName,
        },
      });
    }

    socket.leave(data.roomName);
  });

  socket.on('disconnect', () => {
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
