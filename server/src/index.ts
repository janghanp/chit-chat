import express, { Request, Response } from "express";
import morgan from "morgan";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(morgan("dev"));

app.get("/", (_req: Request, res: Response) => {
  res.json({ hello: "what about this one" });
});

app.get("/users", async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany();

  console.log(users);

  res.status(200).json({ message: "success", data: users });
});

const port = Number(process.env.PORT) || 8080;
const host = "0.0.0.0";

app.listen(port, host, () => {
  console.log(`Listening on port ${port}`);
});
