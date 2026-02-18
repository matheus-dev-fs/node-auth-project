import type { Request, Response } from 'express';
import { User, type UserInstance } from '../models/user.model.js';

export const ping = (req: Request, res: Response): void => {
    res.json({ pong: true });
}

export const register = async (req: Request, res: Response): Promise<void> => {
    const IS_EMAIL_OR_PASSWORD_NOT_SENT: boolean = !req.body.email || !req.body.password;

    if (IS_EMAIL_OR_PASSWORD_NOT_SENT) {
        res.json({ error: 'E-mail e/ou senha não enviados.' });
        return;
    }

    const { email, password }: {
        email: string;
        password: string;
    } = req.body;

    const HAS_USER: UserInstance | null = await User.findOne({ where: { email } });

    if (HAS_USER) {
        res.json({ error: 'E-mail já existe.' });
        return;
    }

    const newUser: UserInstance = await User.create({ email, password });

    res.status(201).json({ id: newUser.id });
}

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password }: {
        email: string | undefined;
        password: string | undefined;
    } = req.body;

    const IS_EMAIL_OR_PASSWORD_NOT_SENT: boolean = !email || !password;

    if (IS_EMAIL_OR_PASSWORD_NOT_SENT) {
        res.json({ error: 'E-mail e/ou senha não enviados.' });
        return;
    }

    const user: UserInstance | null = await User.findOne({
        where: { email, password }
    });

    if (!user) {
        res.json({ status: false });
        return;
    }

    res.json({ status: true });
}

export const list = async (req: Request, res: Response) => {
    const users: UserInstance[] = await User.findAll();

    if (users.length === 0) {
        return res.json({ list: [] });
    }

    const list: string[] = users.map((user: UserInstance): string => user.email);
    res.json({ list });
}