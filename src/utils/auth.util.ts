import type { CredentialValidationResult } from "../types/credential-validation-result.type.js";
import type { ExpectedAuthType } from "../types/expected-auth-type.type.js";
import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { AuthTokenPayload } from "../interfaces/basicAuth/auth-token-payload.interface.js";
import type { BearerCredentialValidationResult } from "../types/bearer-credential-validation-result.type.js";

const isAuthHeaderOfType = (authHeader: string, expectedType: ExpectedAuthType): boolean => {
    return authHeader
        .trim()
        .toLowerCase()
        .startsWith(expectedType.toLowerCase() + ' ');
}

const getAuthCredentialFromHeader = (authHeader: string): string | null => {
    const [, credential]: string[] = authHeader.trim().split(/\s+/, 2);

    if (!credential) {
        return null;
    }

    return credential;
}

const isAuthTokenPayload = (value: JwtPayload | string): value is AuthTokenPayload => {
    if (typeof value === 'string') {
        return false;
    }

    return (
        typeof value.id === 'number' &&
        typeof value.email === 'string' &&
        value.email.trim().length > 0
    );
};

export const parseBasicAuthHeader = (authHeader: string | undefined): CredentialValidationResult => {
    if (!authHeader) {
        return {
            isValid: false,
            error: {
                message: 'Cabeçalho de autorização ausente.',
                status: 400
            },
            data: null
        };
    }

    if (!isAuthHeaderOfType(authHeader, 'Basic')) {
        return {
            isValid: false,
            error: {
                message: 'Tipo de autenticação inválido. Esperado "Basic".',
                status: 400
            },
            data: null
        }
    }

    const hash: string | null = getAuthCredentialFromHeader(authHeader);

    if (!hash) {
        return {
            isValid: false,
            error: {
                message: 'Hash de credenciais ausente no cabeçalho de autorização.',
                status: 400
            },
            data: null
        }
    }

    try {
        const decoded: string = Buffer.from(hash, 'base64').toString('utf-8');
        const separatorIndex: number = decoded.indexOf(':');

        if (separatorIndex <= 0) {
            return {
                isValid: false,
                error: {
                    message: 'Cabeçalho de autorização malformado.',
                    status: 400
                },
                data: null
            };
        }

        const email: string = decoded.slice(0, separatorIndex).trim().toLowerCase();
        const password: string = decoded.slice(separatorIndex + 1);

        if (!email || !password) {
            return {
                isValid: false,
                error: {
                    message: 'E-mail e/ou senha ausentes no cabeçalho de autorização.',
                    status: 400
                },
                data: null
            };
        }

        return {
            isValid: true,
            error: null,
            data: { email, password }
        }
    } catch {
        return {
            isValid: false,
            error: {
                message: 'Hash de credenciais inválido. Não é um Base64 válido.',
                status: 400
            },
            data: null
        };
    }
};

export const parseBearerAuthHeader = (authHeader: string | undefined): BearerCredentialValidationResult => {
    if (!authHeader) {
        return {
            isValid: false,
            error: {
                message: 'Cabeçalho de autorização ausente.',
                status: 400
            },
            data: null
        };
    }

    if (!isAuthHeaderOfType(authHeader, 'Bearer')) {
        return {
            isValid: false,
            error: {
                message: 'Tipo de autenticação inválido. Esperado "Bearer".',
                status: 400
            },
            data: null
        }
    }

    const token: string | null = getAuthCredentialFromHeader(authHeader);

    if (!token) {
        return {
            isValid: false,
            error: {
                message: 'Token de credenciais ausente no cabeçalho de autorização.',
                status: 400
            },
            data: null
        }
    }

    try {
        const secretKey: string | undefined = process.env.JWT_SECRET_KEY;

        if (!secretKey) {
            console.error('[Auth] JWT_SECRET_KEY is not configured.');

            return {
                isValid: false,
                error: {
                    message: 'Erro interno do servidor.',
                    status: 500
                },
                data: null
            };
        }

        const decoded: string | JwtPayload = jwt.verify(token, secretKey);

        if (!isAuthTokenPayload(decoded)) {
            return {
                isValid: false,
                error: {
                    message: 'Token inválido. Payload incompleto.',
                    status: 401
                },
                data: null
            };
        }

        return {
            isValid: true,
            error: null,
            data: {
                token,
                payload: decoded 
            }
        };
    } catch (error: unknown) {
        return {
            isValid: false,
            error: {
                message: 'Token de credenciais inválido ou expirado.',
                status: 401
            },
            data: null
        };
    }
};