import express, { Request, Response } from "express";
import morgan from "morgan";

const app = express();

app.use(morgan("dev"));

app.get("/", (_req: Request, res: Response) => {
  res.json({ hello: "what about this one" });
});

const port = Number(process.env.PORT) || 8080;
const host = "0.0.0.0";

app.listen(port, host, () => {
  console.log(`Listening on port ${port}`);
});
