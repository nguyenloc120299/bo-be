import { ProtectedRequest, PublicRequest } from "app-request";
import { createTokens } from "../../auth/authUtils";
import { SuccessMsgResponse, SuccessResponse } from "../../core/ApiResponse";
import { BadRequestResponse } from "../../core/ApiResponse";
import { UserModel } from "../../database/model/User";
import KeystoreRepo from "../../database/repository/KeystoreRepo";
import asyncHandler from "../../helpers/asyncHandler";
import crypto from "crypto";
import { RoleModel } from "../../database/model/Role";
import { UserTransactionModel } from "../../database/model/UserTransation";
import {
  BET_CONDITION_UP,
  POINT_TYPE_REAL,
  TRANSACTION_STATUS_CANCEL,
  TRANSACTION_STATUS_FINISH,
  TRANSACTION_STATUS_PENDING,
  TRANSACTION_STATUS_PROCESSING,
  TRANSACTION_TYPE_BET,
  TRANSACTION_TYPE_RECHARGE,
  TRANSACTION_TYPE_WITHDRAWAL,
} from "../../constants/define";
import e from "express";
import mongoose, { isObjectIdOrHexString } from "mongoose";
import { getValue } from "../../redis";

const PAGE_SIZE = 20;

export const getAnalyticData1 = async () => {
  const bet_id = await getValue("bet_id");
  const override_result = await getValue("override_result");
  const userBets = await UserTransactionModel.find({
    bet_id,
    transaction_type: TRANSACTION_TYPE_BET,
    transaction_status: {
      $in: [
        TRANSACTION_STATUS_PENDING,
        TRANSACTION_STATUS_FINISH,
        TRANSACTION_STATUS_PROCESSING,
      ],
    },
    point_type: POINT_TYPE_REAL,
  }).populate("user");

  const moneyTotal = userBets.reduce((total, transaction: any) => {
    return total + transaction.bet_value;
  }, 0);

  const moneyUpTotal = userBets
    .filter((transaction) => transaction.bet_condition === BET_CONDITION_UP)
    .reduce((total, transaction: any) => {
      return total + transaction.bet_value;
    }, 0);
  return {
    bet_id,
    override_result,
    userBets,
    moneyTotal,
    moneyUpTotal,
  };
};

const AdminControllers = {
  loginAdmin: asyncHandler(async (req: PublicRequest, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email }).populate("roles");

    if (!user)
      return new BadRequestResponse("Người dùng không tồn tại").send(res);

    if (password != user.password)
      return new BadRequestResponse("Tài khoản hoặc mật khẩu không đúng").send(
        res
      );
    const roles = user.roles as any;

    if (roles && roles?.[0]?.code != "ADMIN")
      return new BadRequestResponse(
        "Chỉ tài khoản admin mới có thể đăng nhập"
      ).send(res);

    const accessTokenKey = crypto.randomBytes(64).toString("hex");
    const refreshTokenKey = crypto.randomBytes(64).toString("hex");

    await KeystoreRepo.create(user, accessTokenKey, refreshTokenKey);

    const tokens = await createTokens(user, accessTokenKey, refreshTokenKey);

    return new SuccessResponse("Đăng nhập thành công", {
      user: user,
      tokens,
    }).send(res);
  }),

  getUsers: asyncHandler(async (req: ProtectedRequest, res) => {
    let page = 1;
    if (req.query.page && !isNaN(parseInt(req.query.page))) {
      page = parseInt(req.query.page);
    }
    const search = req.query.search;

    const searchCriteria = search
      ? {
          $or: [
            {
              _id: isObjectIdOrHexString(search)
                ? new mongoose.Types.ObjectId(search)
                : search,
            },
            { email: search },
            { user_name: search },
          ],
        }
      : {};

    const userRole = await RoleModel.findOne({ code: "USER" });

    const users = await UserModel.aggregate([
      {
        $match: {
          $and: [searchCriteria, { roles: userRole?._id }],
        },
      },
      {
        $lookup: {
          from: "userTransactions",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user", "$$userId"] },
                    { $eq: ["$point_type", POINT_TYPE_REAL] },
                    { $eq: ["$transaction_status", TRANSACTION_STATUS_FINISH] },
                    { $eq: ["$transaction_type", TRANSACTION_TYPE_BET] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: "$user",
                totalValue: { $sum: "$value" },
                totalBet: { $sum: 1 },
                totalWin: { $sum: { $cond: [{ $gt: ["$value", 0] }, 1, 0] } },
                totalLose: { $sum: { $cond: [{ $lte: ["$value", 0] }, 1, 0] } },
              },
            },
          ],
          as: "transactionStats",
        },
      },
      {
        $lookup: {
          from: "userTransactions",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user", "$$userId"] },
                    { $eq: ["$point_type", POINT_TYPE_REAL] },
                    { $eq: ["$transaction_status", TRANSACTION_STATUS_FINISH] },
                    { $eq: ["$transaction_type", TRANSACTION_TYPE_RECHARGE] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: "$user",
                totalValue: { $sum: "$value" },
              },
            },
          ],
          as: "transactionStats1",
        },
      },
      {
        $lookup: {
          from: "userTransactions",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user", "$$userId"] },
                    { $eq: ["$point_type", POINT_TYPE_REAL] },
                    { $eq: ["$transaction_status", TRANSACTION_STATUS_FINISH] },
                    { $eq: ["$transaction_type", TRANSACTION_TYPE_WITHDRAWAL] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: "$user",
                totalValue: { $sum: "$value" },
              },
            },
          ],
          as: "transactionStats2",
        },
      },
      {
        $skip: (page - 1) * PAGE_SIZE,
      },
      {
        $limit: PAGE_SIZE,
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    const userTotal = await UserModel.aggregate([
      {
        $match: {
          $and: [searchCriteria, { roles: userRole?._id }],
        },
      },
      { $count: "total" },
    ]);

    const total = userTotal.length > 0 ? userTotal[0].total : 0;

    const usersData = users.map((user) => {
      const transactionStat = user.transactionStats[0];
      const transactionStat1 = user.transactionStats1[0];
      const transactionStat2 = user.transactionStats2[0];
      return {
        ...user,
        countTotalBet: transactionStat ? transactionStat.totalBet : 0,
        countTotalWin: transactionStat ? transactionStat.totalWin : 0,
        countTotalLose: transactionStat ? transactionStat.totalLose : 0,
        totalValue: transactionStat ? transactionStat.totalValue : 0,
        totalDeposit: transactionStat1 ? transactionStat1.totalValue : 0,
        totalWithdraw: transactionStat2 ? transactionStat2.totalValue : 0,
      };
    });
    return new SuccessResponse("ok", {
      users: usersData,
      total,
    }).send(res);
  }),

  updateUserInfo: asyncHandler(async (req: ProtectedRequest, res) => {
    const {
      userId,
      password,
      user_name,
      name_bank,
      number_bank,
      account_name,
      address,
    } = req.body;

    const user = await UserModel.findByIdAndUpdate(userId);
    if (!user) return new BadRequestResponse("Không tìm thấy user").send(res);

    user.password = password || user.password;
    user.user_name = user_name || user.user_name;
    user.name_bank = name_bank || user.name_bank;
    user.number_bank = number_bank || user.number_bank;
    user.account_name = account_name || user.account_name;
    user.address = address || user.address;
    await user.save();

    return new SuccessMsgResponse("Cập nhật thông tin thành công").send(res);
  }),

  deleteUser: asyncHandler(async (req: ProtectedRequest, res) => {
    const { userId } = req.body;
    await UserModel.findByIdAndDelete(userId);
    return new SuccessMsgResponse("Xóa người dùng thành công").send(res);
  }),

  getDeposit: asyncHandler(async (req: ProtectedRequest, res) => {
    let page = 1;
    if (req.query.page && !isNaN(parseInt(req.query.page))) {
      page = parseInt(req.query.page);
    }
    const deposits = await UserTransactionModel.find({
      point_type: POINT_TYPE_REAL,
      transaction_type: TRANSACTION_TYPE_RECHARGE,
    })
      .populate("user")
      .sort({ createdAt: -1 })
      .skip((page - 1) * 20)
      .limit(20);
    return new SuccessResponse("ok", deposits).send(res);
  }),

  getWithdraw: asyncHandler(async (req: ProtectedRequest, res) => {
    let page = 1;
    if (req.query.page && !isNaN(parseInt(req.query.page))) {
      page = parseInt(req.query.page);
    }
    const withdrawls = await UserTransactionModel.find({
      point_type: POINT_TYPE_REAL,
      transaction_type: TRANSACTION_TYPE_WITHDRAWAL,
    })
      .populate("user")
      .sort({ createdAt: -1 })
      .skip((page - 1) * 20)
      .limit(20);

    return new SuccessResponse("ok", withdrawls).send(res);
  }),

  statisticsDeposit: asyncHandler(async (req: ProtectedRequest, res) => {
    const data = await UserTransactionModel.aggregate([
      {
        $match: {
          $and: [
            { point_type: POINT_TYPE_REAL },
            { transaction_status: TRANSACTION_STATUS_FINISH },
            { transaction_type: TRANSACTION_TYPE_RECHARGE },
          ],
        },
      },
      {
        $group: {
          _id: 0,
          totalValue: { $sum: "$value" },
          totalValueFiat: { $sum: "$fiat_amount" },
        },
      },
    ]);

    const data1 = await UserTransactionModel.aggregate([
      {
        $match: {
          $and: [
            { point_type: POINT_TYPE_REAL },
            { transaction_status: TRANSACTION_STATUS_FINISH },
            { transaction_type: TRANSACTION_TYPE_WITHDRAWAL },
          ],
        },
      },
      {
        $group: {
          _id: 0,
          totalValue: { $sum: "$value" },
          totalValueFiat: { $sum: "$fiat_amount" },
        },
      },
    ]);

    const totalValueDeposit = data[0].totalValue;
    const totalValueFiat = data[0].totalValueFiat;
    const totalValueWithdraw = data1[0].totalValue;
    const totalValueFiatWithdraw = data[0].totalValueFiat;

    return new SuccessResponse("ok", {
      totalValueDeposit,
      totalValueFiat,
      totalValueWithdraw,
      totalValueFiatWithdraw,
    }).send(res);
  }),

  handleWithdrawal: asyncHandler(async (req: ProtectedRequest, res) => {
    const { transId, isResolve, note } = req.body;
    const transaction = await UserTransactionModel.findOne({
      _id: transId,
      transaction_status: TRANSACTION_STATUS_PENDING,
      transaction_type: TRANSACTION_TYPE_WITHDRAWAL,
    });

    if (!transaction)
      return new BadRequestResponse("Không tìm thấy giao dịch này").send(res);

    const user = await UserModel.findById(transaction.user);

    if (!user) return new BadRequestResponse("Không tìm thấy user").send(res);

    if (isResolve) transaction.transaction_status = TRANSACTION_STATUS_FINISH;
    else {
      transaction.transaction_status = TRANSACTION_STATUS_CANCEL;
      user.real_balance = (user?.real_balance || 0) - transaction.value;
      transaction.note = note;
    }

    await user.save();
    await transaction.save();
    return new SuccessMsgResponse(
      `${isResolve ? "Đã duyệt" : "Đã hủy"} rút tiền`
    ).send(res);
  }),

  historyBet: asyncHandler(async (req: ProtectedRequest, res) => {
    let page = 1;
    if (req.query.page && !isNaN(parseInt(req.query.page))) {
      page = parseInt(req.query.page);
    }

    const histories = await UserTransactionModel.find({
      transaction_type: TRANSACTION_TYPE_BET,
    })
      .populate("user")
      .sort({ createdAt: -1 })
      .skip((page - 1) * 20)
      .limit(20);
    return new SuccessResponse("ok", histories).send(res);
  }),

  getAdmin: asyncHandler(async (req: ProtectedRequest, res) => {
    if (!req.user)
      return new BadRequestResponse("Không tìm thấy user").send(res);
    return new SuccessResponse("ok", req.user).send(res);
  }),

  getAnalyticData: asyncHandler(async (req: ProtectedRequest, res) => {
    const bet_id = await getValue("bet_id");
    const override_result = await getValue("override_result");
    const userBets = await UserTransactionModel.find({
      bet_id,
      transaction_type: TRANSACTION_TYPE_BET,
      transaction_status: {
        $in: [
          TRANSACTION_STATUS_PENDING,
          TRANSACTION_STATUS_FINISH,
          TRANSACTION_STATUS_PROCESSING,
        ],
      },
      point_type: POINT_TYPE_REAL,
    }).populate("user");

    const moneyTotal = userBets.reduce((total, transaction: any) => {
      return total + transaction.bet_value;
    }, 0);

    const moneyUpTotal = userBets
      .filter((transaction) => transaction.bet_condition === BET_CONDITION_UP)
      .reduce((total, transaction: any) => {
        return total + transaction.bet_value;
      }, 0);
    return {
      bet_id,
      override_result,
      userBets,
      moneyTotal,
      moneyUpTotal,
    };
    // return new SuccessResponse("ok", {
    //   bet_id,
    //   override_result,
    //   userBets,
    //   moneyTotal,
    //   moneyUpTotal,
    // }).send(res);
  }),
};

export { AdminControllers };
