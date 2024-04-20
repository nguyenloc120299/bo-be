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
  POINT_TYPE_REAL,
  TRANSACTION_STATUS_PENDING,
  TRANSACTION_TYPE_BET,
} from "../constants/define";

const betController = {
  postBet: asyncHandler(async (req: ProtectedRequest, res) => {
    const { bet_value, bet_condition } = req.body;
    const isBet = await getValue("is_bet");
    const bet_id = await getValue("bet_id");

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
};

export { betController };
