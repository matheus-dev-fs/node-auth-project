import type { Request, Response, NextFunction } from 'express';
import { User, type UserInstance } from '../models/user.model.js';

export const ping = (req: Request, res: Response): void => {
    res.json({ pong: true });
}

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const email: string | undefined = req.body.email?.trim();
        const password: string | undefined = req.body.password;

        const IS_EMAIL_OR_PASSWORD_NOT_SENT: boolean = !email || !password;

        if (IS_EMAIL_OR_PASSWORD_NOT_SENT) {
            res.status(400).json({ error: 'E-mail e/ou senha não enviados.' });
            return;
        }

        const HAS_USER: UserInstance | null = await User.findOne({ where: { email } });

        if (HAS_USER) {
            res.status(400).json({ error: 'E-mail já existe.' });
            return;
        }

        const newUser: UserInstance = await User.create({ email, password });

        res.status(201).json({ id: newUser.id });
    } catch (error) {
        next(error);
    }
}

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const email: string | undefined = req.body.email?.trim();
        const password: string | undefined = req.body.password;

        const IS_EMAIL_OR_PASSWORD_NOT_SENT: boolean = !email || !password;

        if (IS_EMAIL_OR_PASSWORD_NOT_SENT) {
            res.status(400).json({ error: 'E-mail e/ou senha não enviados.' });
            return;
        }

        const user: UserInstance | null = await User.findOne({
            where: { email, password }
        });

        if (!user) {
            res.status(401).json({ status: false });
            return;
        }

        res.json({ status: true });
    } catch (error) {
        next(error);
    }
}

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users: UserInstance[] = await User.findAll();

        const IS_LIST_EMPTY: boolean = users.length === 0;

        if (IS_LIST_EMPTY) {
            res.json({ list: [] });
            return;
        }

        const list: string[] = users.map((user: UserInstance): string => user.email);
        res.json({ list });
    } catch (error) {
        next(error);
    }
}