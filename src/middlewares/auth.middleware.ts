import type { Request, Response, NextFunction } from 'express';
import { parseBearerAuthHeader } from '../utils/auth.util.js';
import { User, type UserInstance } from '../models/user.model.js';
import type { BearerCredentialValidationResult } from '../types/bearer-credential-validation-result.type.js';

export const Auth = {
    private: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const credentials: BearerCredentialValidationResult = parseBearerAuthHeader(req.headers.authorization?.toString());

            if (!credentials.isValid) {
                res.setHeader('WWW-Authenticate', 'Bearer realm="Restricted"');
                res.status(credentials.error.status).json({ error: credentials.error.message });
                return;
            }

            const userId: number = credentials.data.payload.id;
            const userEmail: string = credentials.data.payload.email;

            const hasUser: UserInstance | null = await User.findOne({
                where: {
                    id: userId,
                    email: userEmail
                }
            });

            if (!hasUser) {
                res.setHeader('WWW-Authenticate', 'Bearer realm="Restricted"');
                res.status(401).json({ error: 'Credenciais inválidas.' });
                return;
            }

            next();
        } catch (error) {
            next(error);
        }
    }
};