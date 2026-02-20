export type ParseError = Error & {
    status?: number;
    type?: string;
};