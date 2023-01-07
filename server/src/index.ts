import express, { Request, Response } from "express";
import morgan from "morgan";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";

import { PrismaClient } from "@prisma/client";

const app = express();

app.use(morgan("dev"));
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

app.get("/", (_req: Request, res: Response) => {
  res.json({ hello: "world" });
});

io.on("connection", (socket: Socket) => {
  console.log(`A user connected ${socket.id}`);

  socket.on("ping", () => {
    socket.emit("pong");
  });
});

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
