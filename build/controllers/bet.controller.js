"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.betController = void 0;
const asyncHandler_1 = __importDefault(require("../helpers/asyncHandler"));
const redis_1 = require("../redis");
const ApiResponse_1 = require("../core/ApiResponse");
const UserTransation_1 = require("../database/model/UserTransation");
const define_1 = require("../constants/define");
const User_1 = require("../database/model/User");
const bot_noti_1 = require("../bot-noti");
const helpers_1 = require("../utils/helpers");
const betController = {
    postBet: (0, asyncHandler_1.default)(async (req, res) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        const { bet_value, bet_condition } = req.body;
        if (req.user.is_lock_transfer)
            return new ApiResponse_1.BadRequestResponse("Tài khoản của bạn đã bị khóa giao dịch. Vui lòng liên hệ CSKH để biết thêm chi tiết").send(res);
        const isBet = await (0, redis_1.getValue)("is_bet");
        const bet_id = await (0, redis_1.getValue)("bet_id");
        console.log("Đã cược bet_id:", bet_id);
        if (!isBet || !bet_id)
            return new ApiResponse_1.BadRequestResponse("Vui lòng chờ phiên đặt cược bắt đầu").send(res);
        if (bet_value < 1)
            return new ApiResponse_1.BadRequestResponse("Số tiền đặt tối thiểu là 1$").send(res);
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.current_point_type) == "demo" &&
            bet_value > req.user.demo_balance)
            return new ApiResponse_1.BadRequestResponse("Giá trị đặt cược không lơn hơn số tiền đang có").send(res);
        if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.current_point_type) == "real" &&
            bet_value > req.user.real_balance)
            return new ApiResponse_1.BadRequestResponse("Giá trị đặt cược không lơn hơn số tiền đang có").send(res);
        if (((_c = req.user) === null || _c === void 0 ? void 0 : _c.current_point_type) == "real")
            await User_1.UserModel.updateOne({
                _id: (_d = req.user) === null || _d === void 0 ? void 0 : _d._id,
            }, {
                $set: {
                    real_balance: parseFloat((_e = req.user) === null || _e === void 0 ? void 0 : _e.real_balance) - parseFloat(bet_value),
                },
            });
        if (((_f = req.user) === null || _f === void 0 ? void 0 : _f.current_point_type) == "demo")
            await User_1.UserModel.updateOne({
                _id: (_g = req.user) === null || _g === void 0 ? void 0 : _g._id,
            }, {
                $set: {
                    demo_balance: parseFloat((_h = req.user) === null || _h === void 0 ? void 0 : _h.demo_balance) - parseFloat(bet_value),
                },
            });
        await UserTransation_1.UserTransactionModel.create({
            point_type: (_j = req.user) === null || _j === void 0 ? void 0 : _j.current_point_type,
            transaction_type: define_1.TRANSACTION_TYPE_BET,
            transaction_status: define_1.TRANSACTION_STATUS_PENDING,
            bet_condition,
            bet_value,
            bet_id,
            value: -bet_value,
            user: (_k = req.user) === null || _k === void 0 ? void 0 : _k._id,
        });
        if (((_l = req.user) === null || _l === void 0 ? void 0 : _l.current_point_type) === define_1.POINT_TYPE_REAL) {
            await (0, bot_noti_1.sendMessage)(`
       =========${new Date().toLocaleString()}======================
      Thông báo cược 🎲:
      ${req.user.email} đã cược ${(0, helpers_1.formatNumber)(bet_value)}$ cho ${bet_condition === "up" ? "Mua 🟢" : "Bán 🔴"}`);
            const bet_count_str = await (0, redis_1.getValue)("bet_count");
            const bet_count = bet_count_str !== null ? parseInt(bet_count_str) : 0;
            const condition_value_str = await (0, redis_1.getValue)(`condition_${bet_condition}`);
            const condition_value = condition_value_str !== null ? parseInt(condition_value_str) : 0;
            (0, redis_1.setValue)("bet_count", bet_count + 1);
            (0, redis_1.setValue)(`condition_${bet_condition}`, condition_value + 1);
        }
        return new ApiResponse_1.SuccessMsgResponse("Đặt cược thành công").send(res);
    }),
    checkResult: async ({ bet_id, open_price, close_price, bet_condition_result, }) => {
        try {
            const profitPercent = 95;
            const transactions = await UserTransation_1.UserTransactionModel.find({
                transaction_type: define_1.TRANSACTION_TYPE_BET,
                transaction_status: define_1.TRANSACTION_STATUS_PENDING,
                bet_id,
            });
            if (!transactions.length)
                return [];
            const resultsCheck = [];
            await Promise.all(transactions.map(async (trans) => {
                trans.transaction_status = define_1.TRANSACTION_STATUS_FINISH;
                trans.open_price = open_price;
                trans.close_price = close_price;
                if (trans.bet_condition === bet_condition_result) {
                    trans.value = ((trans.bet_value || 0) * profitPercent) / 100;
                    const user = await User_1.UserModel.findById(trans.user);
                    if (user) {
                        let updateField = {};
                        if (trans.point_type === define_1.POINT_TYPE_DEMO) {
                            updateField = {
                                demo_balance: user.demo_balance +
                                    parseFloat(trans.value.toFixed(3)) +
                                    (trans.bet_value || 0),
                            };
                        }
                        if (trans.point_type === define_1.POINT_TYPE_REAL) {
                            updateField = {
                                real_balance: user.real_balance + trans.value + (trans.bet_value || 0),
                            };
                        }
                        await User_1.UserModel.updateOne({ _id: user._id }, {
                            $set: updateField,
                        });
                    }
                    resultsCheck.push(trans);
                }
                await trans.save();
            }));
            return resultsCheck;
        }
        catch (error) {
            console.log("check result", error);
        }
    },
    getTransaction: (0, asyncHandler_1.default)(async (req, res) => {
        var _a, _b, _c, _d, _e, _f;
        const page = (req.query.page || 1);
        const limit = (req.query.limit || 20);
        const transations = await UserTransation_1.UserTransactionModel.find({
            user: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            transaction_type: define_1.TRANSACTION_TYPE_BET,
            point_type: (_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.current_point_type,
            transaction_status: (_c = req.query) === null || _c === void 0 ? void 0 : _c.transaction_status,
        })
            .sort({
            createdAt: -1,
        })
            .skip(page - 1)
            .limit(limit)
            .exec();
        let total_bet_open = 0;
        if (req.query.transaction_status == define_1.TRANSACTION_STATUS_PENDING) {
            total_bet_open = await UserTransation_1.UserTransactionModel.countDocuments({
                user: (_d = req.user) === null || _d === void 0 ? void 0 : _d._id,
                transaction_type: define_1.TRANSACTION_TYPE_BET,
                point_type: (_e = req === null || req === void 0 ? void 0 : req.user) === null || _e === void 0 ? void 0 : _e.current_point_type,
                transaction_status: (_f = req.query) === null || _f === void 0 ? void 0 : _f.transaction_status,
            });
        }
        return new ApiResponse_1.SuccessResponse("ok", {
            total_bet_open,
            transations,
        }).send(res);
    }),
};
exports.betController = betController;
//# sourceMappingURL=bet.controller.js.map