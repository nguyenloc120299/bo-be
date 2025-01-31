import { PublicRequest, RoleRequest } from "app-request";
import asyncHandler from "../helpers/asyncHandler";

import {
  BadRequestResponse,
  SuccessMsgResponse,
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
import { sendMailOTP } from "../helpers/mail";
import _ from "lodash";
import { getValue, setValue } from "../redis";



const validateEmail = (email?: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

function generateOTP(limit: number) {
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < limit; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

const sendOTP = async (user: any) => {
  let dataOtps = (await getValue("otps")) as any;


  dataOtps = dataOtps ? JSON.parse(dataOtps) : [];

  let otpGenerate = generateOTP(5);

  while (
    dataOtps.some(
      (otpData: any) => otpData.user === user && otpData.otp === otpGenerate
    )
  ) {
    otpGenerate = generateOTP(5);
  }

  dataOtps.push({
    user: user,
    otp: otpGenerate,
    time: new Date().getTime() + 1000 *60 *3,
  });

  await setValue("otps", JSON.stringify(dataOtps), 3);

  await sendMailOTP(user, "Xác nhận tài khoản", otpGenerate);

  return otpGenerate;
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
      const userData = _.omit(user, ["otp", "password"]);
      return new SuccessResponse("Đăng nhập thành công", {
        user: userData,
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
        name_code:generateOTP(5),
        ref_code:req.body.ref_code || '',
        roles: [role],
        verified: true,
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


      const userData = _.omit(new_user, ["otp", "password"]);

      return new SuccessResponse(
        "Đã tạo tài khoản thành công. Xin vui lòng đăng nhập",
        { user: userData, tokens }
      ).send(res);
    }
  }),

  signUp: asyncHandler(async (req: PublicRequest, res) => {
    const { email, password, user_name,ref_code } = req.body;
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
      ref_code:ref_code || '',
      name_code:generateOTP(5),
      roles: [role],
    });

    await sendOTP(user);

    
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
    const userData = _.omit(user, ["otp", "password"]);
    return new SuccessResponse(
      "Đã tạo tài khoản thành công. Xin vui lòng đăng nhập",
      { user: userData, tokens }
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

    if (!user.verified) {
      await sendOTP(user);

      const userData = _.omit(user, ["otp", "password"]);

      return new SuccessResponse("Đăng nhập thành công", {
        user: userData,
      }).send(res);
    }

    const accessTokenKey = crypto.randomBytes(64).toString("hex");
    const refreshTokenKey = crypto.randomBytes(64).toString("hex");

    await KeystoreRepo.create(user, accessTokenKey, refreshTokenKey);

    const tokens = await createTokens(user, accessTokenKey, refreshTokenKey);
    const userData = _.omit(user, ["otp", "password"]);
    return new SuccessResponse("Đăng nhập thành công", {
      user: userData,
      tokens,
    }).send(res);
  }),

  verifyOtp: asyncHandler(async (req: PublicRequest, res) => {
    const { otp } = req.body;

    let dataOtps = (await getValue("otps")) as any;

    dataOtps = dataOtps ? JSON.parse(dataOtps) : [];

    const otpData = dataOtps.find((otpData: any) => otpData.otp === otp);

    if (!otpData) return new BadRequestResponse("Mã OTP không đúng").send(res);

    if(otpData.time < new Date().getTime()) return new BadRequestResponse('Mã OTP đã hết hạn').send(res)

    const user = otpData.user;

    
    if (user) {
      user.verified = true;
      await UserModel.findByIdAndUpdate(user._id, user, {
        new: true,
      });
    }

    return new SuccessResponse("OTP verified successfully", true).send(res);
  }),

  sendOTP: asyncHandler(async (req: PublicRequest, res) => {
    const { userId } = req.body;
    const user = await UserModel.findById(userId);
    if (!user) return new BadRequestResponse("Không tìm thấy user").send(res);
    await sendOTP(user);
    return new SuccessMsgResponse(
      "Đã gửi OTP. Vui lòng kiếm tra mail của bạn"
    ).send(res); 
  }),
};

export { AuthController };
