import type { AuthTokenPayload } from "./auth-token-payload.interface.js";

export interface BearerCredentials {
    token: string;
    payload: AuthTokenPayload;
}