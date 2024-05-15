"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.COLLECTION_NAME = exports.DOCUMENT_NAME = void 0;
const mongoose_1 = require("mongoose");
exports.DOCUMENT_NAME = "User";
exports.COLLECTION_NAME = "users";
const schema = new mongoose_1.Schema({
    current_point_type: {
        type: mongoose_1.Schema.Types.String,
        default: "demo",
    },
    user_name: {
        type: mongoose_1.Schema.Types.String,
        trim: true,
        require: true,
        maxlength: 200,
    },
    profilePicUrl: {
        type: mongoose_1.Schema.Types.String,
        trim: true,
    },
    otp: {
        type: mongoose_1.Schema.Types.String,
    },
    expired: {
        type: mongoose_1.Schema.Types.Number,
    },
    real_balance: {
        type: mongoose_1.Schema.Types.Number,
        default: 0,
    },
    demo_balance: {
        type: mongoose_1.Schema.Types.Number,
        default: 1000,
    },
    first_name: {
        type: mongoose_1.Schema.Types.String,
    },
    last_name: {
        type: mongoose_1.Schema.Types.String,
    },
    identity_number: {
        type: mongoose_1.Schema.Types.Number,
    },
    before_identity_card: {
        type: mongoose_1.Schema.Types.String,
    },
    after_identity_card: {
        type: mongoose_1.Schema.Types.String,
    },
    enable_sound: {
        type: mongoose_1.Schema.Types.Boolean,
    },
    is_show_balance: {
        type: mongoose_1.Schema.Types.Boolean,
    },
    user_mode: {
        type: mongoose_1.Schema.Types.String,
        required: true,
    },
    phone: {
        type: mongoose_1.Schema.Types.String,
    },
    is_lock_transfer: {
        type: mongoose_1.Schema.Types.Boolean,
    },
    two_fa: {
        type: mongoose_1.Schema.Types.String,
    },
    address: {
        type: mongoose_1.Schema.Types.String,
    },
    name_bank: {
        type: mongoose_1.Schema.Types.String,
    },
    number_bank: {
        type: mongoose_1.Schema.Types.String,
    },
    account_name: {
        type: mongoose_1.Schema.Types.String,
    },
    is_two_fa: {
        type: mongoose_1.Schema.Types.Boolean,
    },
    status: {
        type: mongoose_1.Schema.Types.Boolean,
        default: true,
    },
    email: {
        type: mongoose_1.Schema.Types.String,
        unique: true,
        sparse: true,
        trim: true,
    },
    password: {
        type: mongoose_1.Schema.Types.String,
    },
    roles: {
        type: [
            {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Role",
            },
        ],
        required: true,
        select: false,
    },
    verified: {
        type: mongoose_1.Schema.Types.Boolean,
        default: false,
    },
    last_login: {
        type: mongoose_1.Schema.Types.Date,
    },
}, {
    versionKey: false,
    timestamps: true,
});
schema.index({ _id: 1, status: 1 });
schema.index({ email: 1 });
schema.index({ status: 1 });
exports.UserModel = (0, mongoose_1.model)(exports.DOCUMENT_NAME, schema, exports.COLLECTION_NAME);
//# sourceMappingURL=User.js.map