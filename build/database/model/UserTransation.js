"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTransactionModel = exports.COLLECTION_NAME = exports.DOCUMENT_NAME = void 0;
const mongoose_1 = require("mongoose");
exports.DOCUMENT_NAME = "UserTransaction";
exports.COLLECTION_NAME = "userTransactions";
const schema = new mongoose_1.Schema({
    code: { type: mongoose_1.Schema.Types.String },
    user: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    point_type: { type: mongoose_1.Schema.Types.String, required: true },
    transaction_type: { type: mongoose_1.Schema.Types.String, required: true },
    transaction_status: { type: mongoose_1.Schema.Types.String, required: true },
    value: { type: mongoose_1.Schema.Types.Number, required: true },
    bet_condition: { type: mongoose_1.Schema.Types.String },
    bet_value: { type: mongoose_1.Schema.Types.Number },
    bet_id: { type: mongoose_1.Schema.Types.String },
    note: { type: mongoose_1.Schema.Types.String },
    open_price: { type: mongoose_1.Schema.Types.Number },
    close_price: { type: mongoose_1.Schema.Types.Number },
    commission_member_id: { type: mongoose_1.Schema.Types.String },
    commission_transaction_id: { type: mongoose_1.Schema.Types.String },
    commission_percent: { type: mongoose_1.Schema.Types.Number },
    commission_type: { type: mongoose_1.Schema.Types.String },
    commission_level: { type: mongoose_1.Schema.Types.Number },
    payment_type: { type: mongoose_1.Schema.Types.String },
    transfer_relation_id: { type: mongoose_1.Schema.Types.String },
    status: {
        type: mongoose_1.Schema.Types.Boolean,
        default: true,
    },
}, {
    versionKey: false,
    timestamps: true,
});
exports.UserTransactionModel = (0, mongoose_1.model)(exports.DOCUMENT_NAME, schema, exports.COLLECTION_NAME);
//# sourceMappingURL=UserTransation.js.map