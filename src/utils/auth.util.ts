import type { CredentialValidationResult } from "../types/credential-validation-result.type.js";
import type { ExpectedAuthType } from "../types/expected-auth-type.type.js";

const isAuthHeaderOfType = (authHeader: string, expectedType: ExpectedAuthType): boolean => {
    return authHeader
        .trim()
        .toLowerCase()
        .startsWith(expectedType.toLowerCase() + ' ');
}

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

    const hash: string | undefined = authHeader.trim().split(' ')[1];

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