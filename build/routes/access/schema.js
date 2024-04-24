"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const validator_1 = require("../../helpers/validator");
exports.default = {
    credential: joi_1.default.object().keys({
        email: joi_1.default.string().required().email(),
        password: joi_1.default.string().required().min(6),
    }),
    refreshToken: joi_1.default.object().keys({
        refreshToken: joi_1.default.string().required().min(1),
    }),
    auth: joi_1.default.object()
        .keys({
        authorization: (0, validator_1.JoiAuthBearer)().required(),
    })
        .unknown(true),
    signup: joi_1.default.object().keys({
        name: joi_1.default.string().required().min(3),
        email: joi_1.default.string().required().email(),
        password: joi_1.default.string().required().min(6),
        profilePicUrl: joi_1.default.string().optional().uri(),
    }),
};
//# sourceMappingURL=schema.js.map