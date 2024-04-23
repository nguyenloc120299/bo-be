import { ProtectedRequest, PublicRequest } from "app-request";
import asyncHandler from "../helpers/asyncHandler";
import {
  BadRequestResponse,
  SuccessMsgResponse,
  SuccessResponse,
} from "../core/ApiResponse";
import KeystoreRepo from "../database/repository/KeystoreRepo";

const UserController = {
  getProfile: asyncHandler(async (req: ProtectedRequest, res) => {
    const user = req.user;
    if (!user) return new BadRequestResponse("Bạn chưa đăng nhập").send(res);
    return new SuccessResponse("User", user).send(res);
  }),
  logOut: asyncHandler(async (req: ProtectedRequest, res) => {
    await KeystoreRepo.remove(req.keystore._id);
    new SuccessMsgResponse("Logout success").send(res);
  }),
};
export { UserController };
