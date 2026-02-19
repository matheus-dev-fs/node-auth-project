import type { CredentialValidationResult } from "../types/credential-validation-result.type.js";

const isBasicAuthHeader = (authHeader: string): boolean => {
    return authHeader.trim().toLowerCase().startsWith('basic ');
}

export const parseBasicAuthHeader = (authHeader?: string): CredentialValidationResult => {
    if (!authHeader) {
        return { 
            isValid: false,
            error: 'Cabeçalho de autorização ausente.',
            data: null
        };
    }

    if (!isBasicAuthHeader(authHeader)) {
        return {
            isValid: false,
            error: 'Cabeçalho de autorização não é do tipo Basic.',
            data: null
        }
    }

    const hash: string | undefined = authHeader.trim().split(' ')[1];

    if (!hash) {
        return {
            isValid: false,
            error: 'Cabeçalho de autorização malformado.',
            data: null
        }
    }

    try {
        const decoded: string = Buffer.from(hash, 'base64').toString('utf-8');
        const separatorIndex: number = decoded.indexOf(':');

        if (separatorIndex <= 0) {
            return {
                isValid: false,
                error: 'Cabeçalho de autorização malformado.',
                data: null
            };
        }

        const email: string = decoded.slice(0, separatorIndex).trim().toLowerCase();
        const password: string = decoded.slice(separatorIndex + 1);

        if (!email || !password) {
            return {
                isValid: false,
                error: 'E-mail e/ou senha ausentes no cabeçalho de autorização.',
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
            error: 'Erro ao decodificar o cabeçalho de autorização.',
            data: null
        };
    }
};