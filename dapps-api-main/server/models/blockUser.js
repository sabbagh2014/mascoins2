const Mongoose = require("mongoose");
const status = require("../enums/status");
const mongoosePaginate = require("mongoose-paginate");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const options = {
  collection: "blockuser",
  timestamps: true,
};

const {Schema} = Mongoose;
const schemaDefination = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    message: {
      type: String,
    },
    time: {
      type: String,
    },
    tillValid: {
      type: Date,
    },
    blockStatus: {
      type: String,
      enum: ["ACTIVE", "BLOCK"],
      default: "BLOCK",
    },
    status: { type: String, default: status.ACTIVE },
  },
  options
);

schemaDefination.plugin(mongoosePaginate);
schemaDefination.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("blockuser", schemaDefination);
