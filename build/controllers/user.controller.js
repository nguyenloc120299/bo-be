"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const crypto_1 = __importDefault(require("crypto"));
const asyncHandler_1 = __importDefault(require("../helpers/asyncHandler"));
const ApiResponse_1 = require("../core/ApiResponse");
const KeystoreRepo_1 = __importDefault(require("../database/repository/KeystoreRepo"));
const UserTransation_1 = require("../database/model/UserTransation");
const define_1 = require("../constants/define");
const axios_1 = __importDefault(require("axios"));
const UserController = {
    callBackRecharge: (0, asyncHandler_1.default)(async (req, res) => {
        const { sign, result, amount, tradeNo, outTradeNo } = req.body;
        console.log("====================================");
        console.log(sign, result, amount, tradeNo, outTradeNo);
        console.log("====================================");
    }),
    postRecharge: (0, asyncHandler_1.default)(async (req, res) => {
        const { amount, payment_method, rateUsd } = req.body;
        if (amount < 5)
            return new ApiResponse_1.BadRequestResponse("Số tiền tối thiểu mỗi lần nạp là 5$").send(res);
        const rechargeTrans = await UserTransation_1.UserTransactionModel.create({
            user: req.user._id,
            point_type: define_1.POINT_TYPE_REAL,
            transaction_type: define_1.TRANSACTION_TYPE_RECHARGE,
            transaction_status: define_1.TRANSACTION_STATUS_PENDING,
            value: amount,
            payment_type: payment_method,
        });
        const merchantKey = "9ed9988588554658a2afad3b0c47424f";
        const requestData = {
            amount: `${amount * (rateUsd || 25000)}`,
            callBackUrl: "https://api-bo.tylekeo-go2q.site/api/auth/callback-recharge",
            memberId: "220456",
            orderNumber: rechargeTrans._id.toString(),
            payType: payment_method,
            playUserIp: "127.0.0.1",
        };
        const parameterNames = Object.keys(requestData).filter((key) => requestData[key] !== null);
        parameterNames.sort();
        const signStr = parameterNames
            .map((key) => `${key}=${requestData[key]}`)
            .join("&");
        const signData = signStr + "&key=" + merchantKey;
        const sign = crypto_1.default
            .createHash("md5")
            .update(signData)
            .digest("hex")
            .toUpperCase();
        const requestDataWithSign = {
            ...requestData,
            sign,
        };
        try {
            const response = await axios_1.default.post(`http://52.69.34.177:20222/api/order/pay/created?amount=${requestDataWithSign.amount}&callBackUrl=https://api-bo.tylekeo-go2q.site/api/auth/callback-recharge&memberId=220456&orderNumber=${requestDataWithSign.orderNumber}&payType=${payment_method}&playUserIp=127.0.0.1&sign=${sign}`);
            if (response && response.data) {
                return new ApiResponse_1.SuccessResponse("Đã gửi lệnh nạp tiền thành công, vui lòng chờ duyệt", response.data).send(res);
            }
        }
        catch (error) {
            console.log(error);
        }
        return new ApiResponse_1.BadRequestResponse("Nạp tiền thất bại vui lòng thử lại sau!!").send(res);
    }),
    getProfile: (0, asyncHandler_1.default)(async (req, res) => {
        const user = req.user;
        if (!user)
            return new ApiResponse_1.BadRequestResponse("Bạn chưa đăng nhập").send(res);
        return new ApiResponse_1.SuccessResponse("User", user).send(res);
    }),
    logOut: (0, asyncHandler_1.default)(async (req, res) => {
        await KeystoreRepo_1.default.remove(req.keystore._id);
        new ApiResponse_1.SuccessMsgResponse("Logout success").send(res);
    }),
};
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map