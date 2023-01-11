import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import morgan from "morgan";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";

import { PrismaClient } from "@prisma/client";
import { checkToken } from "./middleware/auth";
import authRoute from "./routes/authRoute";
import userRoute from "./routes/userRoute";
import chatRoute from "./routes/chatRoute";

interface JoinRoom {
  username: string;
  roomName: string;
}

interface Message {
  userId: string;
  roomName: string;
  username: string;
  text: string;
}

// cloudinary picks up env and is now configured.
cloudinary.v2.config({ secure: true });

const prisma = new PrismaClient();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(morgan("dev"));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/chat", checkToken, chatRoute);

io.on("connect", (socket: Socket) => {
  console.log(`🔌 User connected  |  socket id: ${socket.id}`);

  socket.on("join_room", async (data: JoinRoom) => {
    try {
      //Check wether the chat room that a user is trying to join exsits.
      const chatUserTryingToJoin = await prisma.chat.findUnique({
        where: {
          name: data.roomName,
        },
      });

      if (!chatUserTryingToJoin) {
        throw new Error("No chat room found");
        //? Emit error event?
      }

      // Subscribe the socket channel
      socket.join(data.roomName);

      // Find a user who is trying to join the chat room.
      const user = await prisma.user.findUnique({
        where: {
          username: data.username,
        },
      });

      if (!user) {
        throw new Error("No user found");
      }

      // Connect a user to the existing chat.
      const chat = await prisma.chat.update({
        where: {
          name: data.roomName,
        },
        data: {
          users: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      console.log(`📦 ${data.username} with ID: ${socket.id} joined room: ${data.roomName}`);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("send_message", async (data: Message) => {
    // Create Message
    const { text, userId } = data;

    const message = await prisma.message.create({
      data: {
        text,
        senderId: userId,
      },
    });

    // Send back the message to the chat room
    // socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("👋 User disconnected");
  });
});

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
