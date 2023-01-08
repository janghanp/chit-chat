import * as dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import morgan from "morgan";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoute from "./routes/authRoute";

const app = express();

app.use(morgan("dev"));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

app.get("/", (_req: Request, res: Response) => {
  res.json({ hello: "world" });
});

app.use(authRoute);

io.on("connect", (socket: Socket) => {
  console.log("A user connected");

  socket.emit("welcome", { message: "Welcome to chit-chat!!", id: socket.id });

  socket.on("ping", () => {
    socket.emit("pong");
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
