import { ProtectedRequest, PublicRequest } from "app-request";
import crypto from "crypto";
import asyncHandler from "../helpers/asyncHandler";
import {
  BadRequestResponse,
  SuccessMsgResponse,
  SuccessResponse,
} from "../core/ApiResponse";
import KeystoreRepo from "../database/repository/KeystoreRepo";
import { UserTransactionModel } from "../database/model/UserTransation";
import {
  POINT_TYPE_REAL,
  TRANSACTION_STATUS_PENDING,
  TRANSACTION_TYPE_RECHARGE,
} from "../constants/define";
import axios from "axios";

const UserController = {
  callBackRecharge: asyncHandler(async (req: ProtectedRequest, res) => {
    const { sign, result, amount, tradeNo, outTradeNo } = req.body;
    console.log("====================================");
    console.log(sign, result, amount, tradeNo, outTradeNo);
    console.log("====================================");
  }),
  postRecharge: asyncHandler(async (req: ProtectedRequest, res) => {
    const { amount, payment_method, rateUsd } = req.body;
    if (amount < 5)
      return new BadRequestResponse("Số tiền tối thiểu mỗi lần nạp là 5$").send(
        res
      );
    const rechargeTrans = await UserTransactionModel.create({
      user: req.user._id,
      point_type: POINT_TYPE_REAL,
      transaction_type: TRANSACTION_TYPE_RECHARGE,
      transaction_status: TRANSACTION_STATUS_PENDING,
      value: amount,
      payment_type: payment_method,
    });

    const merchantKey = "9ed9988588554658a2afad3b0c47424f";
    const requestData = {
      amount: `${amount * (rateUsd || 25000)}`,
      callBackUrl:
        "https://api-bo.tylekeo-go2q.site/api/auth/callback-recharge",
      memberId: "220456",
      orderNumber: rechargeTrans._id.toString(),
      payType: payment_method,
      playUserIp: "127.0.0.1",
    } as any;

    const parameterNames = Object.keys(requestData).filter(
      (key) => requestData[key] !== null
    );
    parameterNames.sort();

    const signStr = parameterNames
      .map((key) => `${key}=${requestData[key]}`)
      .join("&");

    const signData = signStr + "&key=" + merchantKey;

    const sign = crypto
      .createHash("md5")
      .update(signData)
      .digest("hex")
      .toUpperCase();

    const requestDataWithSign = {
      ...requestData,
      sign,
    };
    try {
      const response = await axios.post(
        `http://52.69.34.177:20222/api/order/pay/created?amount=${requestDataWithSign.amount}&callBackUrl=https://api-bo.tylekeo-go2q.site/api/auth/callback-recharge&memberId=220456&orderNumber=${requestDataWithSign.orderNumber}&payType=${payment_method}&playUserIp=127.0.0.1&sign=${sign}`
      );
      if (response && response.data) {
        return new SuccessResponse(
          "Đã gửi lệnh nạp tiền thành công, vui lòng chờ duyệt",
          response.data
        ).send(res);
      }
    } catch (error) {
      console.log(error);
    }

    return new BadRequestResponse(
      "Nạp tiền thất bại vui lòng thử lại sau!!"
    ).send(res);
  }),
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
