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
  BET_CONDITION_DOWN,
  BET_CONDITION_UP,
  POINT_TYPE_REAL,
  TRANSACTION_STATUS_CANCEL,
  TRANSACTION_STATUS_FINISH,
  TRANSACTION_STATUS_PENDING,
  TRANSACTION_STATUS_PROCESSING,
  TRANSACTION_TYPE_BET,
  TRANSACTION_TYPE_RECHARGE,
  TRANSACTION_TYPE_REF,
  TRANSACTION_TYPE_WITHDRAWAL,
} from "../../constants/define";
import mongoose, { isObjectIdOrHexString } from "mongoose";
import { getValue, setValue } from "../../redis";
import moment from "moment";
import { sendMessage, testBot } from "../../bot-noti";
import { formatNumber } from "../../utils/helpers";

const PAGE_SIZE = 20;

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
                    { $eq: ["$transaction_type", TRANSACTION_TYPE_REF] },
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
          as: "refProfit",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: (page - 1) * PAGE_SIZE,
      },
      {
        $limit: PAGE_SIZE,
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
      const refProfit = user?.refProfit[0];
      return {
        ...user,
        countTotalBet: transactionStat ? transactionStat.totalBet : 0,
        countTotalWin: transactionStat ? transactionStat.totalWin : 0,
        countTotalLose: transactionStat ? transactionStat.totalLose : 0,
        totalValue: transactionStat ? transactionStat.totalValue : 0,
        totalDeposit: transactionStat1 ? transactionStat1.totalValue : 0,
        totalWithdraw: transactionStat2 ? transactionStat2.totalValue : 0,
        totalProfitRef: refProfit ? refProfit?.totalValue : 0,
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
      real_balance,
      amount_balance,
      level_vip,
      is_lock_transfer,
      is_lock_withdraw,
    } = req.body;
    const user = await UserModel.findByIdAndUpdate(userId);
    if (!user) return new BadRequestResponse("Không tìm thấy user").send(res);
    user.real_balance =
      typeof real_balance === "undefined" ? user.real_balance : real_balance;
    user.password = password || user.password;
    user.user_name = user_name || user.user_name;
    user.name_bank = name_bank || user.name_bank;
    user.number_bank = number_bank || user.number_bank;
    user.account_name = account_name || user.account_name;
    user.address = address || user.address;
    user.level_vip = level_vip || user.level_vip;
    user.is_lock_transfer =
      typeof is_lock_transfer == "undefined"
        ? user.is_lock_transfer
        : is_lock_transfer;
    user.is_lock_withdraw =
      typeof is_lock_withdraw == "undefined"
        ? user.is_lock_withdraw
        : is_lock_withdraw;
    if (amount_balance && amount_balance > 0) {
      const rateUsd = (await getValue("price_usd")) as any;
      await sendMessage(`
          =========${new Date().toLocaleString()}======================
      Thông báo nạp tiền 💰:
     ${req.user.email} nạp ${formatNumber(amount_balance)}$ cho ${user.email}
     `);
      await UserTransactionModel.create({
        user: userId,
        point_type: POINT_TYPE_REAL,
        transaction_type: TRANSACTION_TYPE_RECHARGE,
        transaction_status: TRANSACTION_STATUS_FINISH,
        value: amount_balance,
        payment_type: "",
        fiat_amount: amount_balance * (rateUsd || 25000),
        note: `Admin ${req.user.email} nạp tiền `,
      });
    }

    if (amount_balance && amount_balance < 0) {
      const rateUsd = (await getValue("price_usd")) as any;

      await sendMessage(`
          =========${new Date().toLocaleString()}======================
      Thông báo trừ tiền 💰:
      ${req.user.email} trừ ${formatNumber(amount_balance)}$ cho ${user.email}
      `);

      await UserTransactionModel.create({
        user: userId,
        point_type: POINT_TYPE_REAL,
        transaction_type: TRANSACTION_TYPE_RECHARGE,
        transaction_status: TRANSACTION_STATUS_FINISH,
        value: amount_balance,
        payment_type: "",
        fiat_amount: amount_balance * (rateUsd || 25000),
        note: `Admin ${req.user.email} trừ tiền `,
      });
    }

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
    const total = await UserTransactionModel.countDocuments({
      point_type: POINT_TYPE_REAL,
      transaction_type: TRANSACTION_TYPE_RECHARGE,
    });
    return new SuccessResponse("ok", { deposits, total }).send(res);
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
    const total = await UserTransactionModel.countDocuments({
      point_type: POINT_TYPE_REAL,
      transaction_type: TRANSACTION_TYPE_WITHDRAWAL,
    });
    return new SuccessResponse("ok", { withdrawls, total }).send(res);
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

    const totalValueDeposit = data[0]?.totalValue;
    const totalValueFiat = data[0]?.totalValueFiat;
    const totalValueWithdraw = data1[0]?.totalValue;
    const totalValueFiatWithdraw = data1[0]?.totalValueFiat;

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

  handleRecharge: asyncHandler(async (req: ProtectedRequest, res) => {
    const { transId, isResolve, note } = req.body;
    const transaction = await UserTransactionModel.findOne({
      _id: transId,
      transaction_status: TRANSACTION_STATUS_PENDING,
      transaction_type: TRANSACTION_TYPE_RECHARGE,
    });

    if (!transaction)
      return new BadRequestResponse("Không tìm thấy giao dịch này").send(res);

    const user = await UserModel.findById(transaction.user);

    if (!user) return new BadRequestResponse("Không tìm thấy user").send(res);

    if (isResolve) {
      transaction.transaction_status = TRANSACTION_STATUS_FINISH;
      user.real_balance = (user?.real_balance || 0) + transaction.value;
    } else {
      transaction.transaction_status = TRANSACTION_STATUS_CANCEL;

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
      point_type: POINT_TYPE_REAL,
    })
      .populate("user")
      .sort({ createdAt: -1 })
      .skip((page - 1) * 20)
      .limit(20);

    const total = await UserTransactionModel.countDocuments({
      transaction_type: TRANSACTION_TYPE_BET,
      point_type: POINT_TYPE_REAL,
    });

    return new SuccessResponse("ok", { histories, total }).send(res);
  }),

  getAdmin: asyncHandler(async (req: ProtectedRequest, res) => {
    if (!req.user)
      return new BadRequestResponse("Không tìm thấy user").send(res);
    return new SuccessResponse("ok", req.user).send(res);
  }),

  getAnalyticData: async () => {
    const bet_id = await getValue("bet_id");
    const override_result = await getValue("override_result");
    const member_win_percent = await getValue("member_win_percent");
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

    const totalUserBets = userBets.length;

    const moneyTotal = userBets.reduce((total, transaction: any) => {
      return total + transaction.bet_value;
    }, 0);

    const moneyUpTotal = userBets
      .filter((transaction) => transaction.bet_condition === BET_CONDITION_UP)
      .reduce((total, transaction: any) => {
        return total + transaction.bet_value;
      }, 0);

    const moneyDownTotal = userBets
      .filter((transaction) => transaction.bet_condition === BET_CONDITION_DOWN)
      .reduce((total, transaction: any) => {
        return total + transaction.bet_value;
      }, 0);

    return {
      bet_id,
      override_result,
      userBets,
      moneyTotal,
      moneyUpTotal,
      moneyDownTotal,
      totalUserBets,
      member_win_percent: member_win_percent || 50,
    };
  },

  updateBet: asyncHandler(async (req: ProtectedRequest, res) => {
    const { condition, member_win_percent } = req.body;
    await setValue("override_result", condition);
    if (member_win_percent)
      await setValue("member_win_percent", member_win_percent);
    return new SuccessMsgResponse("Đã chỉnh cược").send(res);
  }),

  dashboarData: asyncHandler(async (req: ProtectedRequest, res) => {
    const today = moment().startOf("day");
    const tomorrow = moment(today).endOf("day");

    const totalUser = await UserModel.countDocuments();
    const totalUserNow = await UserModel.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
    });

    const withdrawlsCount = await UserTransactionModel.countDocuments({
      transaction_status: TRANSACTION_STATUS_FINISH,
      transaction_type: TRANSACTION_TYPE_WITHDRAWAL,
    });

    const withdrawlsCountNow = await UserTransactionModel.countDocuments({
      transaction_status: TRANSACTION_STATUS_FINISH,
      transaction_type: TRANSACTION_TYPE_WITHDRAWAL,
      createdAt: { $gte: today, $lt: tomorrow },
    });

    const withdrawalsTotal = await UserTransactionModel.aggregate([
      {
        $match: {
          transaction_status: TRANSACTION_STATUS_FINISH,
          transaction_type: TRANSACTION_TYPE_WITHDRAWAL,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$value" },
        },
      },
    ]);

    const withdrawalsToday = await UserTransactionModel.find({
      transaction_status: TRANSACTION_STATUS_FINISH,
      transaction_type: TRANSACTION_TYPE_WITHDRAWAL,
      createdAt: { $gte: today, $lte: tomorrow },
    });
    let withdrawalsTotalToday = 0;
    for (const withdrawal of withdrawalsToday) {
      withdrawalsTotalToday += withdrawal.value;
    }
    const depositCount = await UserTransactionModel.countDocuments({
      transaction_status: TRANSACTION_STATUS_FINISH,
      transaction_type: TRANSACTION_TYPE_RECHARGE,
    });

    const depositTotal = await UserTransactionModel.aggregate([
      {
        $match: {
          transaction_status: TRANSACTION_STATUS_FINISH,
          transaction_type: TRANSACTION_TYPE_RECHARGE,
          point_type: POINT_TYPE_REAL,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$value" },
        },
      },
    ]);

    const depositToday = await UserTransactionModel.find({
      transaction_status: TRANSACTION_STATUS_FINISH,
      transaction_type: TRANSACTION_TYPE_RECHARGE,
      point_type: POINT_TYPE_REAL,
      createdAt: { $gte: today, $lte: tomorrow },
    });
    let depositTotalToday = 0;
    for (const deposit of depositToday) {
      depositTotalToday += deposit.value;
    }

    const depositCountNow = await UserTransactionModel.countDocuments({
      transaction_status: TRANSACTION_STATUS_FINISH,
      transaction_type: TRANSACTION_TYPE_RECHARGE,
      createdAt: { $gte: today, $lt: tomorrow },
    });

    const betCount = await UserTransactionModel.countDocuments({
      transaction_status: TRANSACTION_STATUS_FINISH,
      transaction_type: TRANSACTION_TYPE_BET,
      point_type: POINT_TYPE_REAL,
    });

    const betCountNow = await UserTransactionModel.countDocuments({
      transaction_status: TRANSACTION_STATUS_FINISH,
      point_type: POINT_TYPE_REAL,
      transaction_type: TRANSACTION_TYPE_BET,
      createdAt: { $gte: today, $lt: tomorrow },
    });

    const betTotalWin = await UserTransactionModel.aggregate([
      {
        $match: {
          transaction_status: TRANSACTION_STATUS_FINISH,
          transaction_type: TRANSACTION_TYPE_BET,
          point_type: POINT_TYPE_REAL,
          value: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$value" },
        },
      },
    ]);

    const betTotalLose = await UserTransactionModel.aggregate([
      {
        $match: {
          transaction_status: TRANSACTION_STATUS_FINISH,
          transaction_type: TRANSACTION_TYPE_BET,
          point_type: POINT_TYPE_REAL,
          value: { $lt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$value" },
        },
      },
    ]);

    return new SuccessResponse("ok", {
      totalUser,
      totalUserNow,
      withdrawlsCount,
      withdrawlsCountNow,
      withdrawalsTotal: withdrawalsTotal[0]?.total || 0,
      withdrawalsTotalToday: withdrawalsTotalToday,
      depositCount,
      depositCountNow,
      depositTotal: depositTotal[0]?.total || 0,
      depositTotalToday: depositTotalToday,
      betCount,
      betCountNow,
      betTotalWin: betTotalWin[0]?.total,
      betTotalLose: betTotalLose[0]?.total || 0,
    }).send(res);
  }),

  getUserKyc: asyncHandler(async (req: ProtectedRequest, res) => {
    let page = 1;
    if (req.query.page && !isNaN(parseInt(req.query.page))) {
      page = parseInt(req.query.page);
    }
    const users = await UserModel.find({
      is_kyc: "pending",
    })
      .sort({
        createdAt: -1,
      })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE);

    const total = await UserModel.countDocuments({
      is_kyc: "pending",
    });

    return new SuccessResponse("ok", {
      total,
      users,
    }).send(res);
  }),

  handleKycUser: asyncHandler(async (req: ProtectedRequest, res) => {
    const { userId, isKyc } = req.body;
    const user = await UserModel.findById(userId);
    if (!user)
      return new BadRequestResponse("Không tìm thấy người dùng !!").send(res);
    user.is_kyc = isKyc;
    await user.save();
    return new SuccessMsgResponse("Đã xử lý").send(res);
  }),
};

export { AdminControllers };
