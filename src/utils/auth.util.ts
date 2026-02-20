import type { CredentialValidationResult } from "../types/credential-validation-result.type.js";
import type { ExpectedAuthType } from "../types/expected-auth-type.type.js";
import jwt, { JsonWebTokenError, NotBeforeError, TokenExpiredError, type JwtPayload } from 'jsonwebtoken';
import type { AuthTokenPayload } from "../interfaces/basicAuth/auth-token-payload.interface.js";
import type { BearerCredentialValidationResult } from "../types/bearer-credential-validation-result.type.js";
import type { InvalidCredentialsResult } from "../interfaces/basicAuth/invalid-credentials-result.interface.js";

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

const generateInvalidAuthResult = (message: string, status: number): InvalidCredentialsResult => {
    return {
        isValid: false,
        error: {
            message,
            status
        },
        data: null
    };
}

export const parseBasicAuthHeader = (authHeader: string | undefined): CredentialValidationResult => {
    if (!authHeader) {
        const missingHeaderError: CredentialValidationResult = generateInvalidAuthResult(
            'Cabeçalho de autorização ausente.',
            400
        );
        return missingHeaderError;
    }

    if (!isAuthHeaderOfType(authHeader, 'Basic')) {
        const invalidTypeError: CredentialValidationResult = generateInvalidAuthResult(
            'Tipo de autenticação inválido. Esperado "Basic".',
            400
        );
        return invalidTypeError;
    }

    const hash: string | null = getAuthCredentialFromHeader(authHeader);

    if (!hash) {
        const missingHashError: CredentialValidationResult = generateInvalidAuthResult(
            'Hash de credenciais ausente no cabeçalho de autorização.',
            400
        );
        return missingHashError;
    }

    try {
        const decoded: string = Buffer.from(hash, 'base64').toString('utf-8');
        const separatorIndex: number = decoded.indexOf(':');

        if (separatorIndex <= 0) {
            const malformedError: CredentialValidationResult = generateInvalidAuthResult(
                'Cabeçalho de autorização malformado.',
                400
            );
            return malformedError;
        }

        const email: string = decoded.slice(0, separatorIndex).trim().toLowerCase();
        const password: string = decoded.slice(separatorIndex + 1);

        if (!email || !password) {
            const missingCredentialsError: CredentialValidationResult = generateInvalidAuthResult(
                'E-mail e/ou senha ausentes no cabeçalho de autorização.',
                400
            );
            return missingCredentialsError;
        }

        return {
            isValid: true,
            error: null,
            data: { email, password }
        }
    } catch (error: unknown) {
        const invalidHashError: CredentialValidationResult = generateInvalidAuthResult(
            'Hash de credenciais inválido. Não é um Base64 válido.',
            400
        );
        return invalidHashError;
    }
};

export const parseBearerAuthHeader = (authHeader: string | undefined): BearerCredentialValidationResult => {
    if (!authHeader) {
        const missingHeaderError: BearerCredentialValidationResult = generateInvalidAuthResult(
            'Cabeçalho de autorização ausente.',
            400
        );
        return missingHeaderError;
    }

    if (!isAuthHeaderOfType(authHeader, 'Bearer')) {
        const invalidTypeError: BearerCredentialValidationResult = generateInvalidAuthResult(
            'Tipo de autenticação inválido. Esperado "Bearer".',
            400
        );
        return invalidTypeError;
    }

    const token: string | null = getAuthCredentialFromHeader(authHeader);

    if (!token) {
        const invalidTokenError: BearerCredentialValidationResult = generateInvalidAuthResult(
            'Token de credenciais ausente no cabeçalho de autorização.',
            400
        );
        return invalidTokenError;
    }

    try {
        const secretKey: string | undefined = process.env.JWT_SECRET_KEY;

        if (!secretKey) {
            console.error('[Auth] JWT_SECRET_KEY is not configured.');

            const invalidTokenError: BearerCredentialValidationResult = generateInvalidAuthResult(
                'Erro interno no servidor.',
                500
            );
            return invalidTokenError;
        }

        const decoded: string | JwtPayload = jwt.verify(token, secretKey);

        if (!isAuthTokenPayload(decoded)) {
            const invalidTokenError: BearerCredentialValidationResult = generateInvalidAuthResult(
                'Token de credenciais inválido. Payload não contém as informações esperadas.',
                401
            );
            return invalidTokenError;
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
        if (error instanceof TokenExpiredError) {
            const invalidTokenError: BearerCredentialValidationResult = generateInvalidAuthResult(
                'Token de credenciais expirado.',
                401
            );
            return invalidTokenError;
        } else if (error instanceof NotBeforeError) {
            const invalidTokenError: BearerCredentialValidationResult = generateInvalidAuthResult(
                'Token de credenciais não ativo.',
                401
            );
            return invalidTokenError;
        } else if (error instanceof JsonWebTokenError) {
            const invalidTokenError: BearerCredentialValidationResult = generateInvalidAuthResult(
                'Token de credenciais inválido.',
                401
            );
            return invalidTokenError;
        } else {
            console.error('[Auth] Error verifying JWT:', error);

            const invalidTokenError: BearerCredentialValidationResult = generateInvalidAuthResult(
                'Erro interno no servidor.',
                500
            );
            return invalidTokenError;
        }

    }
};