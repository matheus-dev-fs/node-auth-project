import type { BearerCredentials } from '../interfaces/basicAuth/bearer-credentials.interface.js';
import type { InvalidCredentialsResult } from '../interfaces/basicAuth/invalid-credentials-result.interface.js';

export type BearerCredentialValidationResult =
  | { isValid: true; error: null; data: BearerCredentials }
  | InvalidCredentialsResult;