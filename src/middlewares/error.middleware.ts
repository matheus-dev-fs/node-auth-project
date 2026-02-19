import type { ErrorRequestHandler } from 'express';

type ParseError = Error & {
    status?: number;
    type?: string;
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    const error: ParseError = err as ParseError;

    const IS_JSON_PARSE_ERROR: boolean = error.status === 400 && error.type === 'entity.parse.failed';
    if (IS_JSON_PARSE_ERROR) {
        res.status(400).json({
            error: 'JSON inválido. Remova eventuais vírgulas extras ou corrija a estrutura do JSON.'
        });
        return;
    }

    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
};