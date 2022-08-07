const Mongoose = require("mongoose");
const status = require("../enums/status");
const mongoosePaginate = require("mongoose-paginate");

const options = {
  collection: "banner",
  timestamps: true,
};

const {Schema} = Mongoose;
const schemaDefination = new Schema(
  {
    title: { type: String },
    description: { type: String },
    image: { type: String },
    url: { type: String },
    mediaType: {
      type: String,
      enum: ["image", "video"],
    },
    status: { type: String, default: status.ACTIVE },
  },
  options
);
schemaDefination.plugin(mongoosePaginate);
module.exports = Mongoose.model("banner", schemaDefination);
