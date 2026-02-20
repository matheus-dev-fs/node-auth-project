import type { BasicCredentials } from "./basic-credentials.interface.js";
import type { BearerCredentials } from "./bearer-credentials.interface.js";

export interface ValidCredentialsResult {
  isValid: true;
  error: null;
  data: BasicCredentials | BearerCredentials;
}

