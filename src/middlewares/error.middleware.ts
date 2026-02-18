import type { ErrorRequestHandler, Request, Response, NextFunction } from 'express';

export const errorHandler: ErrorRequestHandler = (err, req: Request, res: Response, next: NextFunction) => {
    res.status(400); 
    console.log(err);
    res.json({ error: 'Ocorreu algum erro.' });
}