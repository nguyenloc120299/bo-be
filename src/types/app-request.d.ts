import { Request } from "express";

import Keystore from "../database/model/Keystore";

declare interface PublicRequest extends Request {
  apiKey: any;
}

declare interface RoleRequest extends PublicRequest {
  currentRoleCodes: string[];
}

declare interface ProtectedRequest extends RoleRequest {
  user: any;
  accessToken: string;
  keystore: Keystore;
}

declare interface Tokens {
  accessToken: string;
  refreshToken: string;
}
