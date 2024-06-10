import { ProtectedRequest, PublicRequest } from "app-request";
import crypto from "crypto";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import asyncHandler from "../helpers/asyncHandler";
import {
  BadRequestResponse,
  SuccessMsgResponse,
  SuccessResponse,
} from "../core/ApiResponse";
import KeystoreRepo from "../database/repository/KeystoreRepo";
import { UserTransactionModel } from "../database/model/UserTransation";
import {
  BET_CONDITION_UP,
  MERCHANT_ID,
  MERCHANT_KEY,
  PAYMENT_TYPE_BANK,
  POINT_TYPE_REAL,
  TRANSACTION_STATUS_FINISH,
  TRANSACTION_STATUS_PENDING,
  TRANSACTION_TYPE_BET,
  TRANSACTION_TYPE_RECHARGE,
  TRANSACTION_TYPE_REF,
  TRANSACTION_TYPE_WITHDRAWAL,
} from "../constants/define";
import axios from "axios";
import { UserModel } from "../database/model/User";
// import { getSocketInstance } from "../socket/socketInstance";
// import { getValue } from "../redis";
import _ from "lodash";
import { sendMessage } from "../bot-noti";
import { formatNumber } from "../utils/helpers";
import mongoose from "mongoose";

const UserController = {
  callBackRecharge: asyncHandler(async (req: ProtectedRequest, res) => {
    const { outTradeNo } = req.body;
    console.log("callBackRecharge", outTradeNo);
    // const socket = getSocketInstance();
    //const usersSocket = await getValue("users_socket");

    const transation = await UserTransactionModel.findOne({
      _id: outTradeNo,
      transaction_status: TRANSACTION_STATUS_PENDING,
    });
    if (transation) {
      const user = await UserModel.findById(transation.user);
      if (!user) return res.send("fail");
      user.real_balance = user.real_balance + transation.value;
      transation.transaction_status = TRANSACTION_STATUS_FINISH;

      await user.save();
      await transation.save();
    }
    // socket.emit("recharge", true);
    return res.send("success");
  }),

  postKycProfile: asyncHandler(async (req: ProtectedRequest, res) => {
    const {
      region,
      identity_number,
      before_identity_card,
      after_identity_card,
      first_name,
      last_name,
    } = req.body;

    const user = req.user;

    user.region = region;
    user.identity_number = identity_number;
    user.before_identity_card = before_identity_card;
    user.after_identity_card = after_identity_card;
    user.first_name = first_name;
    user.last_name = last_name;
    user.is_kyc = "pending";

    await UserModel.findByIdAndUpdate(user._id, user, {
      new: true,
    });

    return new SuccessResponse("Đã gửi yêu cầu xác minh", user).send(res);
  }),

  postWithdrawal: asyncHandler(async (req: ProtectedRequest, res) => {
    const { amount, rateUsd } = req.body;
    if (req.user?.is_lock_withdraw)
      return new BadRequestResponse(
        "Tài khoản bạn đã khóa rút tiền. Vui lòng liên hệ CSKH để biết thêm chi tiết"
      ).send(res);
    if (req.user?.is_kyc === "no_kyc")
      return new BadRequestResponse(
        "Vui lòng xác minh danh tính để có thể rút tiền !!"
      ).send(res);

    const withdrawal_amount = parseFloat(amount);

    const minimum_withdrawal = 5;

    if (withdrawal_amount > req.user.real_balance)
      return new BadRequestResponse(
        "Số tiền yêu cầu rút lớn hơn số dư tài khoản Thực"
      ).send(res);
    if (withdrawal_amount < minimum_withdrawal)
      return new BadRequestResponse(
        `Số tiền rút phải lớn hơn ${minimum_withdrawal}`
      ).send(res);

    const transactionWithdraw = await UserTransactionModel.create({
      user: req.user._id,
      point_type: POINT_TYPE_REAL,
      transaction_type: TRANSACTION_TYPE_WITHDRAWAL,
      transaction_status: TRANSACTION_STATUS_PENDING,
      value: -(withdrawal_amount - withdrawal_amount * 0.03),
      payment_type: PAYMENT_TYPE_BANK,
      fiat_amount: (amount * (rateUsd || 25000)).toFixed(2),
    });

    await sendMessage(`
       =========${new Date().toLocaleString()}======================
    Thông báo rút tiền 💰:
    ${req.user.email} rút $${formatNumber(amount)}$ = ${formatNumber(
      amount * (rateUsd || 25000)
    )}VNĐ 
    `);

    req.user.real_balance = req.user.real_balance - withdrawal_amount;

    await UserModel.findByIdAndUpdate(req.user._id, req.user, {
      new: true,
    });
    await transactionWithdraw.save();
    return new SuccessMsgResponse(
      "Đã gửi lệnh rút tiền thành công, vui lòng chờ duyệt"
    ).send(res);
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
      fiat_amount: amount * (rateUsd || 25000),
    });

    const requestData = {
      amount: `${amount * (rateUsd || 25000)}`,
      callBackUrl:
        "https://api-bo.tylekeo-go2q.site/api/auth/callback-recharge",
      memberId: MERCHANT_ID,
      orderNumber: rechargeTrans._id.toString(),
      payType: payment_method,
      playUserIp: req.headers["x-real-ip"] || "127.0.0.1",
    } as any;

    const parameterNames = Object.keys(requestData).filter(
      (key) => requestData[key] !== null
    );
    parameterNames.sort();

    const signStr = parameterNames
      .map((key) => `${key}=${requestData[key]}`)
      .join("&");

    const signData = signStr + "&key=" + MERCHANT_KEY;

    const sign = crypto
      .createHash("md5")
      .update(signData)
      .digest("hex")
      .toUpperCase();

    try {
      const response = await axios.post(
        `http://52.69.34.177:20222/api/order/pay/created?amount=${requestData.amount}&callBackUrl=https://api-bo.tylekeo-go2q.site/api/auth/callback-recharge&memberId=220456&orderNumber=${requestData.orderNumber}&payType=${payment_method}&playUserIp=127.0.0.1&sign=${sign}`
      );
      if (response && response.data) {
        await sendMessage(`
            =========${new Date().toLocaleString()}======================
        Thông báo nạp tiền 💰:
        ${req.user.email} nạp $${formatNumber(amount)}$ = ${formatNumber(
          amount * (rateUsd || 25000)
        )}VNĐ 
        `);

        return new SuccessResponse(
          "Đã gửi lệnh nạp tiền thành công, vui lòng chờ duyệt",
          response.data
        ).send(res);
      }
    } catch (error) {
      return new BadRequestResponse(
        "Nạp tiền thất bại vui lòng thử lại sau!!"
      ).send(res);
    }

    return new BadRequestResponse(
      "Nạp tiền thất bại vui lòng thử lại sau!!"
    ).send(res);
  }),

  getProfile: asyncHandler(async (req: ProtectedRequest, res) => {
    const user = req.user;
    if (!user) return new BadRequestResponse("Bạn chưa đăng nhập").send(res);
    const userData = _.omit(user, ["otp", "password"]);
    return new SuccessResponse("User", userData).send(res);
  }),

  updateProfile: asyncHandler(async (req: ProtectedRequest, res) => {
    const {
      point_type,
      avatar,
      first_name,
      last_name,
      current_point_type,
      enable_sound,
      is_show_balance,
      address,
      name_bank,
      number_bank,
      account_name,
      profilePicUrl,
    } = req.body;
    const user = req.user;
    user.profilePicUrl = profilePicUrl || user.profilePicUrl;
    user.avatar = avatar || user.avatar;
    user.current_point_type = point_type || user.point_type;
    user.first_name = first_name || user.first_name;
    user.last_name = last_name || user.last_name;
    user.current_point_type = current_point_type || user.current_point_type;
    user.enable_sound =
      typeof enable_sound != "undefined" ? enable_sound : user.enable_sound;
    user.is_show_balance =
      typeof is_show_balance != "undefined"
        ? is_show_balance
        : user.is_show_balance;
    user.address = address || user.address;
    user.name_bank = name_bank || user.name_bank;
    user.number_bank = number_bank || user.number_bank;
    user.account_name = account_name || user.account_name;
    await UserModel.findByIdAndUpdate(user._id, user, {
      new: true,
    });
    return new SuccessResponse("Đã cập nhật thành công", user).send(res);
  }),

  getTwoFaKey: asyncHandler(async (req: ProtectedRequest, res) => {
    const secret = speakeasy.generateSecret({ length: 20 });
    const authString = speakeasy.otpauthURL({
      secret: secret.base32,
      label: "BIZKUB",
      issuer: "BIZKUB",
      encoding: "base32",
    });
    qrcode.toDataURL(authString, (err, qrCodeData) => {
      if (err) {
        return res.status(500).json({ message: "Internal Server Error" });
      }

      return res.json({
        secret: secret.ascii,
        auth_string: qrCodeData,
      });
    });
  }),

  getDashboard: asyncHandler(async (req: ProtectedRequest, res) => {
    const transactions = await UserTransactionModel.find({
      user: req.user._id,
      point_type: POINT_TYPE_REAL,
      transaction_type: TRANSACTION_TYPE_BET,
      transaction_status: TRANSACTION_STATUS_FINISH,
    });

    const totalAll = transactions.length;
    const fund = transactions.reduce(
      (sum, transaction: any) => sum + transaction.bet_value,
      0
    );

    const totalWinCount = transactions.filter(
      (transaction) => transaction.value > 0
    ).length;
    const totalLoseCount = transactions.filter(
      (transaction) => transaction.value < 0
    ).length;

    const profit = transactions.reduce(
      (sum, transaction) => sum + transaction.value,
      0
    );

    const revenue = fund + profit;

    const totalUp = transactions.filter(
      (transaction) => transaction.bet_condition === BET_CONDITION_UP
    ).length;

    // Round down fund, profit, and revenue to the nearest integer
    const floorFund = Math.floor(fund);
    const floorProfit = Math.floor(profit);
    const floorRevenue = Math.floor(revenue);

    return new SuccessResponse("ok", {
      totalAll,
      floorFund,
      totalWinCount,
      totalLoseCount,
      floorProfit,
      floorRevenue,
      totalUp,
      percent_up: totalAll != 0 ? Math.floor((totalUp * 100) / totalAll) : 0,
    }).send(res);
  }),
  getAnalysisRef: asyncHandler(async (req: ProtectedRequest, res) => {
    const totalRef = await UserModel.countDocuments({
      ref_code: req.user.name_code,
    });

    const totalProfit = await UserTransactionModel.aggregate([
      {
        $match: {
          transaction_status: TRANSACTION_STATUS_FINISH,
          transaction_type: TRANSACTION_TYPE_REF,
          user: req.user._id,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$value" },
        },
      },
    ]);
    console.log(totalProfit);

    return new SuccessResponse("ok", {
      totalRef,
      totalProfit: totalProfit[0]?.total || 0,
    }).send(res);
  }),

  withdrawRefBalance: asyncHandler(async (req: ProtectedRequest, res) => {
    const user = req.user;
    if (user.ref_balance <= 0)
      return new BadRequestResponse("Số tiền hoa hồng không đủ để rút").send(
        res
      );
    user.real_balance = (user.ref_balance || 0) + (user.real_balance || 0);
    user.ref_balance = 0;
    await UserModel.findByIdAndUpdate(user._id, user);
    return new SuccessResponse("ok", user).send(res);
  }),
  resetDemoBalance: asyncHandler(async (req: ProtectedRequest, res) => {
    const user = req.user;
    user.demo_balance = 1000;
    await UserModel.findByIdAndUpdate(user?._id, user);
    return new SuccessMsgResponse("Thành công").send(res);
  }),
  logOut: asyncHandler(async (req: ProtectedRequest, res) => {
    await KeystoreRepo.remove(req.keystore._id);
    new SuccessMsgResponse("Logout success").send(res);
  }),
};
export { UserController };
