"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const crypto_1 = __importDefault(require("crypto"));
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const asyncHandler_1 = __importDefault(require("../helpers/asyncHandler"));
const ApiResponse_1 = require("../core/ApiResponse");
const KeystoreRepo_1 = __importDefault(require("../database/repository/KeystoreRepo"));
const UserTransation_1 = require("../database/model/UserTransation");
const define_1 = require("../constants/define");
const axios_1 = __importDefault(require("axios"));
const User_1 = require("../database/model/User");
const lodash_1 = __importDefault(require("lodash"));
const UserController = {
    callBackRecharge: (0, asyncHandler_1.default)(async (req, res) => {
        const { outTradeNo } = req.body;
        console.log("callBackRecharge", outTradeNo);
        // const socket = getSocketInstance();
        //const usersSocket = await getValue("users_socket");
        const transation = await UserTransation_1.UserTransactionModel.findOne({
            _id: outTradeNo,
            transaction_status: define_1.TRANSACTION_STATUS_PENDING,
        });
        if (transation) {
            const user = await User_1.UserModel.findById(transation.user);
            if (!user)
                return res.send("fail");
            user.real_balance = user.real_balance + transation.value;
            transation.transaction_status = define_1.TRANSACTION_STATUS_FINISH;
            await user.save();
            await transation.save();
        }
        // socket.emit("recharge", true);
        return res.send("success");
    }),
    postWithdrawal: (0, asyncHandler_1.default)(async (req, res) => {
        const { amount, rateUsd } = req.body;
        const withdrawal_amount = parseFloat(amount);
        const minimum_withdrawal = 5;
        if (withdrawal_amount > req.user.real_balance)
            return new ApiResponse_1.BadRequestResponse("Số tiền yêu cầu rút lớn hơn số dư tài khoản Thực").send(res);
        if (withdrawal_amount < minimum_withdrawal)
            return new ApiResponse_1.BadRequestResponse(`Số tiền rút phải lớn hơn ${minimum_withdrawal}`).send(res);
        const transactionWithdraw = await UserTransation_1.UserTransactionModel.create({
            user: req.user._id,
            point_type: define_1.POINT_TYPE_REAL,
            transaction_type: define_1.TRANSACTION_TYPE_WITHDRAWAL,
            transaction_status: define_1.TRANSACTION_STATUS_PENDING,
            value: -withdrawal_amount,
            payment_type: define_1.PAYMENT_TYPE_BANK,
            fiat_amount: (amount * (rateUsd || 25000)).toFixed(2)
        });
        req.user.real_balance = req.user.real_balance - withdrawal_amount;
        await User_1.UserModel.findByIdAndUpdate(req.user._id, req.user, {
            new: true,
        });
        await transactionWithdraw.save();
        return new ApiResponse_1.SuccessMsgResponse("Đã gửi lệnh rút tiền thành công, vui lòng chờ duyệt").send(res);
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
            fiat_amount: amount * (rateUsd || 25000)
        });
        const requestData = {
            amount: `${amount * (rateUsd || 25000)}`,
            callBackUrl: "https://api-bo.tylekeo-go2q.site/api/auth/callback-recharge",
            memberId: define_1.MERCHANT_ID,
            orderNumber: rechargeTrans._id.toString(),
            payType: payment_method,
            playUserIp: req.headers["x-real-ip"] || "127.0.0.1",
        };
        const parameterNames = Object.keys(requestData).filter((key) => requestData[key] !== null);
        parameterNames.sort();
        const signStr = parameterNames
            .map((key) => `${key}=${requestData[key]}`)
            .join("&");
        const signData = signStr + "&key=" + define_1.MERCHANT_KEY;
        const sign = crypto_1.default
            .createHash("md5")
            .update(signData)
            .digest("hex")
            .toUpperCase();
        try {
            const response = await axios_1.default.post(`http://52.69.34.177:20222/api/order/pay/created?amount=${requestData.amount}&callBackUrl=https://api-bo.tylekeo-go2q.site/api/auth/callback-recharge&memberId=220456&orderNumber=${requestData.orderNumber}&payType=${payment_method}&playUserIp=127.0.0.1&sign=${sign}`);
            if (response && response.data) {
                return new ApiResponse_1.SuccessResponse("Đã gửi lệnh nạp tiền thành công, vui lòng chờ duyệt", response.data).send(res);
            }
        }
        catch (error) {
            return new ApiResponse_1.BadRequestResponse("Nạp tiền thất bại vui lòng thử lại sau!!").send(res);
        }
        return new ApiResponse_1.BadRequestResponse("Nạp tiền thất bại vui lòng thử lại sau!!").send(res);
    }),
    getProfile: (0, asyncHandler_1.default)(async (req, res) => {
        const user = req.user;
        if (!user)
            return new ApiResponse_1.BadRequestResponse("Bạn chưa đăng nhập").send(res);
        const userData = lodash_1.default.omit(user, ['otp', 'password']);
        return new ApiResponse_1.SuccessResponse("User", userData).send(res);
    }),
    updateProfile: (0, asyncHandler_1.default)(async (req, res) => {
        const { point_type, avatar, first_name, last_name, current_point_type, enable_sound, is_show_balance, address, name_bank, number_bank, account_name } = req.body;
        const user = req.user;
        user.avatar = avatar || user.avatar;
        user.current_point_type = point_type || user.point_type;
        user.first_name = first_name || user.first_name;
        user.last_name = last_name || user.last_name;
        user.current_point_type = current_point_type || user.current_point_type;
        user.enable_sound = enable_sound || user.enable_sound;
        user.is_show_balance = is_show_balance || user.is_show_balance;
        user.address = address || user.address;
        user.name_bank = name_bank || user.name_bank;
        user.number_bank = number_bank || user.number_bank;
        user.account_name = account_name || user.account_name;
        await User_1.UserModel.findByIdAndUpdate(user._id, user, {
            new: true,
        });
        return new ApiResponse_1.SuccessResponse("Đã cập nhật thành công", user).send(res);
    }),
    getTwoFaKey: (0, asyncHandler_1.default)(async (req, res) => {
        const secret = speakeasy_1.default.generateSecret({ length: 20 });
        const authString = speakeasy_1.default.otpauthURL({
            secret: secret.base32,
            label: "BIZKUB",
            issuer: "BIZKUB",
            encoding: "base32",
        });
        qrcode_1.default.toDataURL(authString, (err, qrCodeData) => {
            if (err) {
                return res.status(500).json({ message: "Internal Server Error" });
            }
            return res.json({
                secret: secret.ascii,
                auth_string: qrCodeData,
            });
        });
    }),
    logOut: (0, asyncHandler_1.default)(async (req, res) => {
        await KeystoreRepo_1.default.remove(req.keystore._id);
        new ApiResponse_1.SuccessMsgResponse("Logout success").send(res);
    }),
};
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map