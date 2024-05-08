import { PublicRequest, RoleRequest } from "app-request";
import asyncHandler from "../helpers/asyncHandler";
import { OAuth2Client } from "google-auth-library";
import {
  BadRequestResponse,

  SuccessResponse,
} from "../core/ApiResponse";
import {
  POINT_TYPE_DEMO,
  TRANSACTION_STATUS_FINISH,
  TRANSACTION_TYPE_RECHARGE,
  USER_MODE_MEMBER,
} from "../constants/define";
import { UserModel } from "../database/model/User";
import { UserTransactionModel } from "../database/model/UserTransation";
import crypto from "crypto";
import KeystoreRepo from "../database/repository/KeystoreRepo";
import { createTokens } from "../auth/authUtils";
import { RoleModel } from "../database/model/Role";
import { jwtDecode } from "jwt-decode";

const client = new OAuth2Client(
  `782297257397-t9ntj9ikius66fp40evqtb95m1ecb0dt.apps.googleusercontent.com`
);

const validateEmail = (email?: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const AuthController = {
  googleLogin: asyncHandler(async (req: PublicRequest, res) => {
    const credentialRes = jwtDecode(req.body.credential) as any;
    if (!credentialRes)
      return new BadRequestResponse("Đăng nhập thất bại").send(res);

    const accessTokenKey = crypto.randomBytes(64).toString("hex");
    const refreshTokenKey = crypto.randomBytes(64).toString("hex");
    const user = await UserModel.findOne({ email: credentialRes.email });
    if (user) {
      await KeystoreRepo.create(user, accessTokenKey, refreshTokenKey);

      const tokens = await createTokens(user, accessTokenKey, refreshTokenKey);

      return new SuccessResponse("Đăng nhập thành công", {
        user: user,
        tokens,
      }).send(res);
    } else {
      const password = credentialRes.email;
      const role = await RoleModel.findOne({ code: "USER" })
        .select("+code")
        .lean()
        .exec();
      if (!role) throw new BadRequestResponse("Role must be defined").send(res);
      const new_user = await UserModel.create({
        user_mode: USER_MODE_MEMBER,
        email: credentialRes.email,
        password: password,
        user_name: credentialRes.name,
        roles: [role],
      });
      const keystore = await KeystoreRepo.create(
        new_user,
        accessTokenKey,
        refreshTokenKey
      );

      const tokens = await createTokens(
        new_user,
        keystore.primaryKey,
        keystore.secondaryKey
      );
      await UserTransactionModel.create({
        user: new_user._id,
        point_type: POINT_TYPE_DEMO,
        transaction_type: TRANSACTION_TYPE_RECHARGE,
        transaction_status: TRANSACTION_STATUS_FINISH,
        value: 1000,
        note: "Nạp demo khi đăng kí thành công",
      });
      return new SuccessResponse(
        "Đã tạo tài khoản thành công. Xin vui lòng đăng nhập",
        { user: new_user, tokens }
      ).send(res);
    }
  }),
  signUp: asyncHandler(async (req: PublicRequest, res) => {
    const { email, password, user_name } = req.body;
    if (!email || !validateEmail(email))
      return new BadRequestResponse("Email không hợp lệ").send(res);
    if (!password)
      return new BadRequestResponse("Mật khẩu không được để trống").send(res);
    if (!user_name)
      return new BadRequestResponse("Nickname không được để trống").send(res);
    const member = await UserModel.findOne({ email });

    if (member)
      return new BadRequestResponse(
        "Email  đã tồn tại trong hệ thống. Vui lòng thử lại với Emal khác"
      ).send(res);

    const accessTokenKey = crypto.randomBytes(64).toString("hex");
    const refreshTokenKey = crypto.randomBytes(64).toString("hex");
    const role = await RoleModel.findOne({ code: "USER" })
      .select("+code")
      .lean()
      .exec();
    if (!role) throw new BadRequestResponse("Role must be defined").send(res);
    const user = await UserModel.create({
      user_mode: USER_MODE_MEMBER,
      email,
      password,
      user_name,
      roles: [role],
    });
    const keystore = await KeystoreRepo.create(
      user,
      accessTokenKey,
      refreshTokenKey
    );

    const tokens = await createTokens(
      user,
      keystore.primaryKey,
      keystore.secondaryKey
    );
    await UserTransactionModel.create({
      user: user._id,
      point_type: POINT_TYPE_DEMO,
      transaction_type: TRANSACTION_TYPE_RECHARGE,
      transaction_status: TRANSACTION_STATUS_FINISH,
      value: 1000,
      note: "Nạp demo khi đăng kí thành công",
    });
    return new SuccessResponse(
      "Đã tạo tài khoản thành công. Xin vui lòng đăng nhập",
      { user, tokens }
    ).send(res);
  }),

  signIn: asyncHandler(async (req: PublicRequest, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user)
      return new BadRequestResponse("Người dùng không tồn tại").send(res);

    if (password != user.password)
      return new BadRequestResponse("Tài khoản hoặc mật khẩu không đúng").send(
        res
      );
    const accessTokenKey = crypto.randomBytes(64).toString("hex");
    const refreshTokenKey = crypto.randomBytes(64).toString("hex");

    await KeystoreRepo.create(user, accessTokenKey, refreshTokenKey);

    const tokens = await createTokens(user, accessTokenKey, refreshTokenKey);

    return new SuccessResponse("Đăng nhập thành công", {
      user: user,
      tokens,
    }).send(res);
  }),
};

export { AuthController };
