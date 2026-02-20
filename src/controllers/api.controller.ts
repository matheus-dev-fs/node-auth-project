import type { Request, Response, NextFunction } from 'express';
import { User, type UserInstance } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const ping = (req: Request, res: Response): void => {
    res.json({ pong: true });
}

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const email: string | undefined = req.body.email?.trim();
        const password: string | undefined = req.body.password;

        if (!email || !password) {
            res.status(400).json({ error: 'E-mail e/ou senha não enviados.' });
            return;
        }

        const HAS_USER: UserInstance | null = await User.findOne({ where: { email } });

        if (HAS_USER) {
            res.status(400).json({ error: 'E-mail já existe.' });
            return;
        }

        const encryptedPassword: string = await bcrypt.hash(password, 10);
        const newUser: UserInstance = await User.create({ email, password: encryptedPassword });

        const token: string = jwt.sign(
            { id: newUser.id, email: newUser.email },
            process.env.JWT_SECRET_KEY as string,
            { expiresIn: '1h' }
        );

        res.status(201).json({ id: newUser.id, email: newUser.email, token });
    } catch (error) {
        next(error);
    }
}

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const email: string | undefined = req.body.email?.trim();
        const password: string | undefined = req.body.password;

        if (!email || !password) {
            res.status(400).json({ error: 'E-mail e/ou senha não enviados.' });
            return;
        }

        const user: UserInstance | null = await User.findOne({
            where: { email }
        });

        if (!user) {
            res.status(401).json({ status: false });
            return;
        }

        const IS_PASSWORD_VALID: boolean = await bcrypt.compare(password, user.password);

        if (!IS_PASSWORD_VALID) {
            res.status(401).json({ status: false });
            return;
        }

        const token: string = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET_KEY as string,
            { expiresIn: '1h' }
        );

        res.json({ status: true, email: user.email, token });
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