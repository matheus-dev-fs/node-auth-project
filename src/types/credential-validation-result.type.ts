import type { InvalidCredentialsResult } from "../interfaces/basicAuth/invalid-credentials-result.interface.js";
import type { ValidCredentialsResult } from "../interfaces/basicAuth/valid-credentials-result.interface.js";

export type CredentialValidationResult =
  | ValidCredentialsResult
  | InvalidCredentialsResult;