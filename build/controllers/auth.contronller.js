"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const asyncHandler_1 = __importDefault(require("../helpers/asyncHandler"));
const ApiResponse_1 = require("../core/ApiResponse");
const define_1 = require("../constants/define");
const User_1 = require("../database/model/User");
const UserTransation_1 = require("../database/model/UserTransation");
const crypto_1 = __importDefault(require("crypto"));
const KeystoreRepo_1 = __importDefault(require("../database/repository/KeystoreRepo"));
const authUtils_1 = require("../auth/authUtils");
const Role_1 = require("../database/model/Role");
const jwt_decode_1 = require("jwt-decode");
const mail_1 = require("../helpers/mail");
const lodash_1 = __importDefault(require("lodash"));
const redis_1 = require("../redis");
const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
};
function generateOTP(limit) {
    var digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < limit; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}
const sendOTP = async (user) => {
    let dataOtps = (await (0, redis_1.getValue)("otps"));
    dataOtps = dataOtps ? JSON.parse(dataOtps) : [];
    let otpGenerate = generateOTP(5);
    while (dataOtps.some((otpData) => otpData.user === user && otpData.otp === otpGenerate)) {
        otpGenerate = generateOTP(5);
    }
    dataOtps.push({
        user: user,
        otp: otpGenerate,
        time: new Date().getTime() + 1000 * 60 * 3,
    });
    await (0, redis_1.setValue)("otps", JSON.stringify(dataOtps), 3);
    await (0, mail_1.sendMailOTP)(user, "Xác nhận tài khoản", otpGenerate);
    return otpGenerate;
};
const AuthController = {
    googleLogin: (0, asyncHandler_1.default)(async (req, res) => {
        const credentialRes = (0, jwt_decode_1.jwtDecode)(req.body.credential);
        if (!credentialRes)
            return new ApiResponse_1.BadRequestResponse("Đăng nhập thất bại").send(res);
        const accessTokenKey = crypto_1.default.randomBytes(64).toString("hex");
        const refreshTokenKey = crypto_1.default.randomBytes(64).toString("hex");
        const user = await User_1.UserModel.findOne({ email: credentialRes.email });
        if (user) {
            await KeystoreRepo_1.default.create(user, accessTokenKey, refreshTokenKey);
            const tokens = await (0, authUtils_1.createTokens)(user, accessTokenKey, refreshTokenKey);
            const userData = lodash_1.default.omit(user, ["otp", "password"]);
            return new ApiResponse_1.SuccessResponse("Đăng nhập thành công", {
                user: userData,
                tokens,
            }).send(res);
        }
        else {
            const password = credentialRes.email;
            const role = await Role_1.RoleModel.findOne({ code: "USER" })
                .select("+code")
                .lean()
                .exec();
            if (!role)
                throw new ApiResponse_1.BadRequestResponse("Role must be defined").send(res);
            const new_user = await User_1.UserModel.create({
                user_mode: define_1.USER_MODE_MEMBER,
                email: credentialRes.email,
                password: password,
                user_name: credentialRes.name,
                name_code: generateOTP(5),
                ref_code: req.body.ref_code || '',
                roles: [role],
                verified: true,
            });
            const keystore = await KeystoreRepo_1.default.create(new_user, accessTokenKey, refreshTokenKey);
            const tokens = await (0, authUtils_1.createTokens)(new_user, keystore.primaryKey, keystore.secondaryKey);
            await UserTransation_1.UserTransactionModel.create({
                user: new_user._id,
                point_type: define_1.POINT_TYPE_DEMO,
                transaction_type: define_1.TRANSACTION_TYPE_RECHARGE,
                transaction_status: define_1.TRANSACTION_STATUS_FINISH,
                value: 1000,
                note: "Nạp demo khi đăng kí thành công",
            });
            const userData = lodash_1.default.omit(new_user, ["otp", "password"]);
            return new ApiResponse_1.SuccessResponse("Đã tạo tài khoản thành công. Xin vui lòng đăng nhập", { user: userData, tokens }).send(res);
        }
    }),
    signUp: (0, asyncHandler_1.default)(async (req, res) => {
        const { email, password, user_name, ref_code } = req.body;
        if (!email || !validateEmail(email))
            return new ApiResponse_1.BadRequestResponse("Email không hợp lệ").send(res);
        if (!password)
            return new ApiResponse_1.BadRequestResponse("Mật khẩu không được để trống").send(res);
        if (!user_name)
            return new ApiResponse_1.BadRequestResponse("Nickname không được để trống").send(res);
        const member = await User_1.UserModel.findOne({ email });
        if (member)
            return new ApiResponse_1.BadRequestResponse("Email  đã tồn tại trong hệ thống. Vui lòng thử lại với Emal khác").send(res);
        const accessTokenKey = crypto_1.default.randomBytes(64).toString("hex");
        const refreshTokenKey = crypto_1.default.randomBytes(64).toString("hex");
        const role = await Role_1.RoleModel.findOne({ code: "USER" })
            .select("+code")
            .lean()
            .exec();
        if (!role)
            throw new ApiResponse_1.BadRequestResponse("Role must be defined").send(res);
        const user = await User_1.UserModel.create({
            user_mode: define_1.USER_MODE_MEMBER,
            email,
            password,
            user_name,
            ref_code: ref_code || '',
            name_code: generateOTP(5),
            roles: [role],
        });
        await sendOTP(user);
        const keystore = await KeystoreRepo_1.default.create(user, accessTokenKey, refreshTokenKey);
        const tokens = await (0, authUtils_1.createTokens)(user, keystore.primaryKey, keystore.secondaryKey);
        await UserTransation_1.UserTransactionModel.create({
            user: user._id,
            point_type: define_1.POINT_TYPE_DEMO,
            transaction_type: define_1.TRANSACTION_TYPE_RECHARGE,
            transaction_status: define_1.TRANSACTION_STATUS_FINISH,
            value: 1000,
            note: "Nạp demo khi đăng kí thành công",
        });
        const userData = lodash_1.default.omit(user, ["otp", "password"]);
        return new ApiResponse_1.SuccessResponse("Đã tạo tài khoản thành công. Xin vui lòng đăng nhập", { user: userData, tokens }).send(res);
    }),
    signIn: (0, asyncHandler_1.default)(async (req, res) => {
        const { email, password } = req.body;
        const user = await User_1.UserModel.findOne({ email });
        if (!user)
            return new ApiResponse_1.BadRequestResponse("Người dùng không tồn tại").send(res);
        if (password != user.password)
            return new ApiResponse_1.BadRequestResponse("Tài khoản hoặc mật khẩu không đúng").send(res);
        if (!user.verified) {
            await sendOTP(user);
            const userData = lodash_1.default.omit(user, ["otp", "password"]);
            return new ApiResponse_1.SuccessResponse("Đăng nhập thành công", {
                user: userData,
            }).send(res);
        }
        const accessTokenKey = crypto_1.default.randomBytes(64).toString("hex");
        const refreshTokenKey = crypto_1.default.randomBytes(64).toString("hex");
        await KeystoreRepo_1.default.create(user, accessTokenKey, refreshTokenKey);
        const tokens = await (0, authUtils_1.createTokens)(user, accessTokenKey, refreshTokenKey);
        const userData = lodash_1.default.omit(user, ["otp", "password"]);
        return new ApiResponse_1.SuccessResponse("Đăng nhập thành công", {
            user: userData,
            tokens,
        }).send(res);
    }),
    verifyOtp: (0, asyncHandler_1.default)(async (req, res) => {
        const { otp } = req.body;
        let dataOtps = (await (0, redis_1.getValue)("otps"));
        dataOtps = dataOtps ? JSON.parse(dataOtps) : [];
        const otpData = dataOtps.find((otpData) => otpData.otp === otp);
        if (!otpData)
            return new ApiResponse_1.BadRequestResponse("Mã OTP không đúng").send(res);
        if (otpData.time < new Date().getTime())
            return new ApiResponse_1.BadRequestResponse('Mã OTP đã hết hạn').send(res);
        const user = otpData.user;
        if (user) {
            user.verified = true;
            await User_1.UserModel.findByIdAndUpdate(user._id, user, {
                new: true,
            });
        }
        return new ApiResponse_1.SuccessResponse("OTP verified successfully", true).send(res);
    }),
    sendOTP: (0, asyncHandler_1.default)(async (req, res) => {
        const { userId } = req.body;
        const user = await User_1.UserModel.findById(userId);
        if (!user)
            return new ApiResponse_1.BadRequestResponse("Không tìm thấy user").send(res);
        await sendOTP(user);
        return new ApiResponse_1.SuccessMsgResponse("Đã gửi OTP. Vui lòng kiếm tra mail của bạn").send(res);
    }),
};
exports.AuthController = AuthController;
//# sourceMappingURL=auth.contronller.js.map