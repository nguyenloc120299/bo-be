import { ProtectedRequest } from "app-request";
import asyncHandler from "../helpers/asyncHandler";
import { getValue, setValue } from "../redis";
import {
  BadRequestResponse,
  SuccessMsgResponse,
  SuccessResponse,
} from "../core/ApiResponse";
import { UserTransactionModel } from "../database/model/UserTransation";
import {
  POINT_TYPE_DEMO,
  POINT_TYPE_REAL,
  TRANSACTION_STATUS_FINISH,
  TRANSACTION_STATUS_PENDING,
  TRANSACTION_TYPE_BET,
} from "../constants/define";
import { UserModel } from "../database/model/User";
import { sendMessage } from "../bot-noti";
import { formatNumber } from "../utils/helpers";
import moment from "moment";

const betController = {
  postBet: asyncHandler(async (req: ProtectedRequest, res) => {
    const { bet_value, bet_condition } = req.body;

    if (req.user.is_lock_transfer)
      return new BadRequestResponse(
        "Tài khoản của bạn đã bị khóa giao dịch. Vui lòng liên hệ CSKH để biết thêm chi tiết"
      ).send(res);

    const isBet = await getValue("is_bet");
    const bet_id = await getValue("bet_id");

    console.log("Đã cược bet_id:", bet_id);

    if (!isBet || !bet_id)
      return new BadRequestResponse("Vui lòng chờ phiên đặt cược bắt đầu").send(
        res
      );
    if (bet_value < 1)
      return new BadRequestResponse("Số tiền đặt tối thiểu là 1$").send(res);

    if (
      req.user?.current_point_type == "demo" &&
      bet_value > req.user.demo_balance
    )
      return new BadRequestResponse(
        "Giá trị đặt cược không lơn hơn số tiền đang có"
      ).send(res);

    if (
      req.user?.current_point_type == "real" &&
      bet_value > req.user.real_balance
    )
      return new BadRequestResponse(
        "Giá trị đặt cược không lơn hơn số tiền đang có"
      ).send(res);
    if (req.user?.current_point_type == "real")
      await UserModel.updateOne(
        {
          _id: req.user?._id,
        },
        {
          $set: {
            real_balance:
              parseFloat(req.user?.real_balance) - parseFloat(bet_value),
          },
        }
      );
    if (req.user?.current_point_type == "demo")
      await UserModel.updateOne(
        {
          _id: req.user?._id,
        },
        {
          $set: {
            demo_balance:
              parseFloat(req.user?.demo_balance) - parseFloat(bet_value),
          },
        }
      );
    await UserTransactionModel.create({
      point_type: req.user?.current_point_type,
      transaction_type: TRANSACTION_TYPE_BET,
      transaction_status: TRANSACTION_STATUS_PENDING,
      bet_condition,
      bet_value,
      bet_id,
      value: -bet_value,
      user: req.user?._id,
    });

    if (req.user?.current_point_type === POINT_TYPE_REAL) {
      await sendMessage(`
       =========${new Date().toLocaleString()}======================
      Thông báo cược 🎲:
      ${req.user.email} đã cược ${formatNumber(bet_value)}$ cho ${
        bet_condition === "up" ? "Mua 🟢" : "Bán 🔴"
      }`);

      const bet_count_str: string | null = await getValue("bet_count");
      const bet_count: number =
        bet_count_str !== null ? parseInt(bet_count_str) : 0;

      const condition_value_str: string | null = await getValue(
        `condition_${bet_condition}`
      );
      const condition_value: number =
        condition_value_str !== null ? parseInt(condition_value_str) : 0;

      setValue("bet_count", bet_count + 1);
      setValue(`condition_${bet_condition}`, condition_value + 1);
    }
    return new SuccessMsgResponse("Đặt cược thành công").send(res);
  }),
  checkResult: async ({
    bet_id,
    open_price,
    close_price,
    bet_condition_result,
  }: {
    bet_id: string;
    open_price: number;
    close_price: number;
    bet_condition_result: string;
  }) => {
    try {
      const profitPercent = 95;
      const transactions = await UserTransactionModel.find({
        transaction_type: TRANSACTION_TYPE_BET,
        transaction_status: TRANSACTION_STATUS_PENDING,
        bet_id,
      });

      if (!transactions.length) return [];

      const resultsCheck = [] as any;

      await Promise.all(
        transactions.map(async (trans) => {
          trans.transaction_status = TRANSACTION_STATUS_FINISH;
          trans.open_price = open_price;
          trans.close_price = close_price;

          if (trans.bet_condition === bet_condition_result) {
            trans.value = ((trans.bet_value || 0) * profitPercent) / 100;
            const user = await UserModel.findById(trans.user);

            if (user) {
              let updateField = {};

              if (trans.point_type === POINT_TYPE_DEMO) {
                updateField = {
                  demo_balance:
                    user.demo_balance +
                    parseFloat(trans.value.toFixed(3)) +
                    (trans.bet_value || 0),
                };
              }

              if (trans.point_type === POINT_TYPE_REAL) {
                updateField = {
                  real_balance:
                    user.real_balance + trans.value + (trans.bet_value || 0),
                };
              }

              await UserModel.updateOne(
                { _id: user._id },
                {
                  $set: updateField,
                }
              );
            }

            resultsCheck.push(trans);
          }
          await trans.save();
        })
      );

      return resultsCheck;
    } catch (error) {
      console.log("check result", error);
    }
  },

  getTransaction: asyncHandler(async (req: ProtectedRequest, res) => {
    const page = (req.query.page || 1) as any;
    const limit = (req.query.limit || 20) as any; 
    const startDateStr = req.query.startDate as string;
    const endDateStr = req.query.endDate as string;

    const startDate = startDateStr && moment(startDateStr).isValid() ? moment(startDateStr).toDate() : null;
    const endDate = endDateStr && moment(endDateStr).isValid() ? moment(endDateStr).toDate() : null;

    const dateCondition = startDate && endDate ? { $gte: startDate, $lte: endDate } : {};

    const transations = await UserTransactionModel.find({
      user: req.user?._id,
      transaction_type: TRANSACTION_TYPE_BET,
      point_type: POINT_TYPE_REAL,
      transaction_status: req.query?.transaction_status,
      createdAt: dateCondition
    })
      .sort({
        createdAt: -1,
      })
      .skip(page - 1)
      .limit(limit)
      .exec();

    let total_bet_open = 0;
    
    if (req.query.transaction_status == TRANSACTION_STATUS_PENDING) {

      total_bet_open = await UserTransactionModel.countDocuments({
        user: req.user?._id,
        transaction_type: TRANSACTION_TYPE_BET,
        point_type: req?.user?.current_point_type,
        transaction_status: req.query?.transaction_status,
      });
    }
    
    return new SuccessResponse("ok", {
      total_bet_open,
      transations,
    }).send(res);
  }),
};

export { betController };
