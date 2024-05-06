"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const asyncHandler_1 = __importDefault(require("../helpers/asyncHandler"));
const google_auth_library_1 = require("google-auth-library");
const ApiResponse_1 = require("../core/ApiResponse");
const define_1 = require("../constants/define");
const User_1 = require("../database/model/User");
const UserTransation_1 = require("../database/model/UserTransation");
const crypto_1 = __importDefault(require("crypto"));
const KeystoreRepo_1 = __importDefault(require("../database/repository/KeystoreRepo"));
const authUtils_1 = require("../auth/authUtils");
const Role_1 = require("../database/model/Role");
const jwt_decode_1 = require("jwt-decode");
const client = new google_auth_library_1.OAuth2Client(`782297257397-t9ntj9ikius66fp40evqtb95m1ecb0dt.apps.googleusercontent.com`);
const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
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
            return new ApiResponse_1.SuccessResponse("Đăng nhập thành công", {
                user: user,
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
                roles: [role],
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
            return new ApiResponse_1.SuccessResponse("Đã tạo tài khoản thành công. Xin vui lòng đăng nhập", { user: new_user, tokens }).send(res);
        }
    }),
    signUp: (0, asyncHandler_1.default)(async (req, res) => {
        const { email, password, user_name } = req.body;
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
            roles: [role],
        });
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
        return new ApiResponse_1.SuccessResponse("Đã tạo tài khoản thành công. Xin vui lòng đăng nhập", { user, tokens }).send(res);
    }),
    signIn: (0, asyncHandler_1.default)(async (req, res) => {
        const { email, password } = req.body;
        const user = await User_1.UserModel.findOne({ email });
        if (!user)
            return new ApiResponse_1.BadRequestResponse("Người dùng không tồn tại").send(res);
        if (password != user.password)
            return new ApiResponse_1.BadRequestResponse("Tài khoản hoặc mật khẩu không đúng").send(res);
        const accessTokenKey = crypto_1.default.randomBytes(64).toString("hex");
        const refreshTokenKey = crypto_1.default.randomBytes(64).toString("hex");
        await KeystoreRepo_1.default.create(user, accessTokenKey, refreshTokenKey);
        const tokens = await (0, authUtils_1.createTokens)(user, accessTokenKey, refreshTokenKey);
        return new ApiResponse_1.SuccessResponse("Đăng nhập thành công", {
            user: user,
            tokens,
        }).send(res);
    }),
};
exports.AuthController = AuthController;
//# sourceMappingURL=auth.contronller.js.map