import { Request, Response, Router } from 'express';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    return res.status(200).json({ socket: 'socket' });
});

router.post('/', async (req: Request, res: Response) => {
    return res.status(200).json({ socket: 'socket' });
});

export default router;
