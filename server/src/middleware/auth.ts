import { Request, Response, NextFunction } from "express";

import { TokenType, verifyToken } from "../utils/token";

export const checkToken = (req: Request, res: Response, next: NextFunction) => {
  const token: string | null = req.cookies.token;

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const decodedToken = verifyToken(token);

    req.token = decodedToken;

    next();
  } catch (error) {
    console.log(error);

    return res.sendStatus(401);
  }
};
