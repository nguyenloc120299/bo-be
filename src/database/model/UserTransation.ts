import { Schema, model, Types } from "mongoose";

export const DOCUMENT_NAME = "UserTransaction";
export const COLLECTION_NAME = "userTransactions";

const schema = new Schema(
  {
    code: { type: Schema.Types.String },
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    point_type: { type: Schema.Types.String, required: true },
    transaction_type: { type: Schema.Types.String, required: true },
    transaction_status: { type: Schema.Types.String, required: true },
    value: { type: Schema.Types.Number, required: true },
    bet_condition: { type: Schema.Types.String },
    bet_value: { type: Schema.Types.Number },
    bet_id: { type: Schema.Types.String },
    note: { type: Schema.Types.String },
    open_price: { type: Schema.Types.Number },
    close_price: { type: Schema.Types.Number },
    commission_member_id: { type: Schema.Types.String },
    commission_transaction_id: { type: Schema.Types.String },
    commission_percent: { type: Schema.Types.Number },
    commission_type: { type: Schema.Types.String },
    commission_level: { type: Schema.Types.Number },
    payment_type: { type: Schema.Types.String },
    transfer_relation_id: { type: Schema.Types.String },
    status: {
      type: Schema.Types.Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const UserTransactionModel = model(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);
