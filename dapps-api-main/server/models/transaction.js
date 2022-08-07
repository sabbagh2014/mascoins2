const Mongoose = require("mongoose");
const status = require("../enums/status");
const mongoosePaginate = require("mongoose-paginate");

const options = {
  collection: "transactions",
  timestamps: true,
};

const {Schema} = Mongoose;
const schemaDefination = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    nftId: {
      type: Schema.Types.ObjectId,
      ref: "nft",
    },
    nftUserId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    referrarId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    toDonationUser: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    amount: { type: Number },
    recipientAddress: { type: String },
    adminCommission: { type: Number },
    transactionHash: { type: String },
    coinName: { type: String },
    transactionStatus: {
      type: String,
      enum: ["PROCESSING", "PENDING", "SUCCESS", "FAILED"],
      default: "PROCESSING",
    },
    transactionType: { type: String },
    status: { type: String, default: status.ACTIVE },
  },
  options
);

schemaDefination.plugin(mongoosePaginate);
module.exports = Mongoose.model("transaction", schemaDefination);
