import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { User, type UserInstance } from '../models/user.model.js';
import { parseBasicAuthHeader } from '../utils/auth.util.js';
import type { BasicCredentials } from '../interfaces/basicAuth/basic-credentials.interface.js';
import type { CredentialValidationResult } from '../types/credential-validation-result.type.js';

export const Auth = {
    private: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const credentials: CredentialValidationResult = parseBasicAuthHeader(req.headers.authorization?.toString());

            if (!credentials.isValid) {
                res.setHeader('WWW-Authenticate', 'Basic realm="Restricted"');
                res.status(credentials.error.status).json({ error: credentials.error.message });
                return;
            }

            const { email, password }: BasicCredentials = credentials.data;

            const user: UserInstance | null = await User.findOne({ where: { email } });

            if (!user) {
                res.status(401).json({ error: 'Credenciais inválidas.' });
                return;
            }

            const isPasswordValid: boolean = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                res.status(401).json({ error: 'Credenciais inválidas.' });
                return;
            }

            next();
        } catch (error) {
            next(error);
        }
    }
};