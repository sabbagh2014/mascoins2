const Mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const status = require("../enums/status");
const options = {
  collection: "bufferUser",
  timestamps: true,
};
const {Schema} = Mongoose;
const bufferModel = new Schema(
  {
    email: { type: String },
    otp: { type: Number },
    otpVerification: { type: Boolean, default: false },
    otpTime: { type: Number },

    status: { type: String, default: status.ACTIVE },
  },
  options
);
bufferModel.plugin(mongoosePaginate);
bufferModel.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("bufferUser", bufferModel);
