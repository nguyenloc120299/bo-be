import { ProtectedRequest, PublicRequest } from "app-request";
import { createTokens } from "../../auth/authUtils";
import { SuccessResponse } from "../../core/ApiResponse";
import { BadRequestResponse } from "../../core/ApiResponse";
import { UserModel } from "../../database/model/User";
import KeystoreRepo from "../../database/repository/KeystoreRepo";
import asyncHandler from "../../helpers/asyncHandler";
import crypto from "crypto";
import { RoleModel } from "../../database/model/Role";
import { UserTransactionModel } from "../../database/model/UserTransation";
import { POINT_TYPE_REAL, TRANSACTION_STATUS_FINISH, TRANSACTION_TYPE_BET } from "../../constants/define";


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

   getUsers : asyncHandler(async (req: ProtectedRequest, res) => {
    let page = 1;
    if (req.query.page && !isNaN(parseInt(req.query.page))) {
      page = parseInt(req.query.page);
    }
  
    const userRole = await RoleModel.findOne({ code: "USER" });
  
    const users = await UserModel.aggregate([
      {
        $match: {
          roles: userRole?._id
        }
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
                    { $eq: ["$transaction_type", TRANSACTION_TYPE_BET] }
                  ]
                }
              }
            },
            {
              $group: {
                _id: "$user",
                totalValue: { $sum: "$value" },
                totalBet: { $sum: 1 },
                totalWin: { $sum: { $cond: [{ $gt: ["$value", 0] }, 1, 0] } },
                totalLose: { $sum: { $cond: [{ $lte: ["$value", 0] }, 1, 0] } }
              }
            }
          ],
          as: "transactionStats"
        }
      },
      {
        $skip: (page - 1) * PAGE_SIZE
      },
      {
        $limit: PAGE_SIZE
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);
  
    const total = await UserModel.countDocuments({ roles: userRole?._id });
    const usersData = users.map(user => {
      
      const transactionStat = user.transactionStats[0]; // transactionStats là một mảng, chúng ta lấy phần tử đầu tiên
      return {
        ...user,
        countTotalBet: transactionStat ? transactionStat.totalBet : 0,
        countTotalWin: transactionStat ? transactionStat.totalWin : 0,
        countTotalLose: transactionStat ? transactionStat.totalLose : 0,
        totalValue:transactionStat ? transactionStat.totalValue : 0
      };
    });
    return new SuccessResponse("ok", {
      users:usersData,
      total
    }).send(res);
  
  })
  
};
export { AdminControllers };
