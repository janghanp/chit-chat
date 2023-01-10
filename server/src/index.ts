import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import morgan from "morgan";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";

import authRoute from "./routes/authRoute";
import profileRoute from "./routes/profileRoute";

const app = express();

app.use(morgan("dev"));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// cloudinary picks up env and is now configured.
cloudinary.v2.config({ secure: true });

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(authRoute);
app.use(profileRoute);

io.on("connect", (socket: Socket) => {
  console.log(`🔌 User connected  |  socket id: ${socket.id}`);

  socket.on("join_room", (data) => {
    // socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("disconnect", () => {
    console.log("👋 User disconnected");
  });
});

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
