import type { BasicCredentials } from "./basic-credentials.interface.js";

export interface ValidCredentialsResult {
  isValid: true;
  error: null;
  data: BasicCredentials;
}

