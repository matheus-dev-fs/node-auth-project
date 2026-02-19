import type { Request, Response, NextFunction } from 'express';
import { User, type UserInstance } from '../models/user.model.js';
import bcrypt from 'bcrypt';

export const Auth = {
    private: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authHeader: string | undefined = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({ error: 'Token de autenticação não fornecido.' });
            return;
        }

        const hash: string | undefined = authHeader.split(' ')[1];

        if (!hash) {
            res.status(401).json({ error: 'Token de autenticação mal formatado.' });
            return;
        }

        const decode: string = Buffer.from(hash, 'base64').toString('utf-8');
        const [email, password] = decode.split(':');

        if (!email || !password) {
            res.status(401).json({ error: 'Token de autenticação mal formatado.' });
            return;
        }

        const hasUser: UserInstance | null = await User.findOne({ where: { email } });

        if (!hasUser) {
            res.status(401).json({ error: 'Credenciais inválidas.' });
            return;
        }

        const isPasswordValid: boolean = await bcrypt.compare(password, hasUser.password);

        if (!isPasswordValid) {
            res.status(401).json({ error: 'Credenciais inválidas.' });
            return;
        }

        next();
    }
};