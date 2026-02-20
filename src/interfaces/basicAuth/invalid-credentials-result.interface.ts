import type { InvalidCredentialsError } from "./invalid-credentials-error.interface.js";

export interface InvalidCredentialsResult {
  isValid: false;
  error: InvalidCredentialsError;
  data: null;
}