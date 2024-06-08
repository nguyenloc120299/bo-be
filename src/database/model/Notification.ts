
import  { Schema, model, Types } from "mongoose";

export const DOCUMENT_NAME = "Notifications";
export const COLLECTION_NAME = "notifications";

const schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    title: {
      type: Schema.Types.String,
      require: true,
    },
    content: {
      type: Schema.Types.String,
      require: true,
    },
    is_read: {
      type: Schema.Types.Boolean,
      default: true,
    },
    link: {
      type: Schema.Types.String,
    },
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

export const SampleModel = model(DOCUMENT_NAME, schema, COLLECTION_NAME);
