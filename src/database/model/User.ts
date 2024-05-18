import { model, Schema, Types } from "mongoose";
import Role from "./Role";

export const DOCUMENT_NAME = "User";
export const COLLECTION_NAME = "users";

const schema = new Schema(
  {
    current_point_type: {
      type: Schema.Types.String,
      default: "demo",
    },
    user_name: {
      type: Schema.Types.String,
      trim: true,
      require: true,
      maxlength: 200,
    },
    profilePicUrl: {
      type: Schema.Types.String,
      trim: true,
    },
    otp: {
      type: Schema.Types.String,
    },
    expired: {
      type: Schema.Types.Number,
    },
    real_balance: {
      type: Schema.Types.Number,
      default: 0,
    },
    demo_balance: {
      type: Schema.Types.Number,
      default: 1000,
    },
    first_name: {
      type: Schema.Types.String,
    },
    last_name: {
      type: Schema.Types.String,
    },
    region: {
      type: Schema.Types.String,
    },
    identity_number: {
      type: Schema.Types.Number,
    },
    before_identity_card: {
      type: Schema.Types.String,
    },
    after_identity_card: {
      type: Schema.Types.String,
    },
    enable_sound: {
      type: Schema.Types.Boolean,
    },
    is_show_balance: {
      type: Schema.Types.Boolean,
    },
    user_mode: {
      type: Schema.Types.String,
      required: true,
    },
    phone: {
      type: Schema.Types.String,
    },
    is_kyc: {
      type: Schema.Types.String,
      default: "no_kyc",
    },
    is_lock_transfer: {
      type: Schema.Types.Boolean,
      default: false,
    },
    is_lock_withdraw: {
      type: Schema.Types.Boolean,
      default: false,
    },
    two_fa: {
      type: Schema.Types.String,
    },
    address: {
      type: Schema.Types.String,
    },
    name_bank: {
      type: Schema.Types.String,
    },
    number_bank: {
      type: Schema.Types.String,
    },
    account_name: {
      type: Schema.Types.String,
    },
    is_two_fa: {
      type: Schema.Types.Boolean,
    },
    status: {
      type: Schema.Types.Boolean,
      default: true,
    },
    email: {
      type: Schema.Types.String,
      unique: true,
      sparse: true, // allows null
      trim: true,
    },
    password: {
      type: Schema.Types.String,
    },
    roles: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Role",
        },
      ],
      required: true,
      select: false,
    },
    verified: {
      type: Schema.Types.Boolean,
      default: false,
    },

    last_login: {
      type: Schema.Types.Date,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

schema.index({ _id: 1, status: 1 });
schema.index({ email: 1 });
schema.index({ status: 1 });

export const UserModel = model(DOCUMENT_NAME, schema, COLLECTION_NAME);
