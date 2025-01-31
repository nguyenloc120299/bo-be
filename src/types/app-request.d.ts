import { Request } from "express";

import Keystore from "../database/model/Keystore";
import { Socket } from "socket.io";

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
  io: Socket;
  query: {
    page: string;
    transaction_status:string
    limit:string
    search:string
    startDate:string
    endDate:string
    transaction_type:string
  };
}

declare interface Tokens {
  accessToken: string;
  refreshToken: string;
}
