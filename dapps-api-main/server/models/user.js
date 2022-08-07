const bcrypt = require("bcryptjs");
const Mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const userType = require("../enums/userType");
const status = require("../enums/status");
const commonFunction = require("../../server/helper/util");

const options = {
  collection: "user",
  timestamps: true,
};

const { Schema } = Mongoose;
const userModel = new Schema(
  {
    walletAddress: { type: String },
    ethAccount: {
      address: { type: String },
      privateKey: { type: String },
    },
    btcAccount: {
      address: { type: String },
      privateKey: { type: String },
    },
    tronAccount: {
      address: { type: String },
      privateKey: { type: String },
    },
    ip: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    name: { type: String },
    phoneNumber: { type: String },
    userName: { type: String },
    email: { type: String },
    profilePic: { type: String },
    coverPic: { type: String },
    masPageUrl: { type: String },
    speciality: { type: String },
    bio: { type: String },
    facebook: { type: String },
    twitter: { type: String },
    youtube: { type: String },
    telegram: { type: String },
    countryCode: { type: String },
    noOfBundle: { type: Number, default: 0 },
    mobileNumber: { type: String },
    userType: { type: String, default: userType.USER },
    socialId: { type: String },
    socialType: { type: String },
    password: { type: String },
    planType: { type: String, default: "Basic" },
    twoFAUrl: { type: String },
    base32: { type: String },
    deviceToken: { type: String },
    deviceType: { type: String },
    referralCode: { type: String },
    isReset: { type: Boolean },
    otp: { type: Number },
    emailVerification: { type: Boolean, default: false },
    otpVerification: { type: Boolean, default: false },
    otpTime: { type: Number },
    blockStatus: { type: Boolean, default: false },
    isUpdated: { type: Boolean, default: false },
    isNewUser: { type: Boolean, default: true },
    masBalance: { type: Number, default: 0 },
    usdtBalance: { type: Number, default: 0 },
    bnbBalance: { type: Number, default: 0 },
    busdBalance: { type: Number, default: 0 },
    referralUserId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    supporters: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    supporterCount: {
      type: Number,
      default: 0,
    },
    subscriberCount: {
      type: Number,
      default: 0,
    },
    likesUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    profileSubscriberCount: {
      type: Number,
      default: 0,
    },
    profileSubscribe: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    subscriberList: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    subscribeNft: [
      {
        type: Schema.Types.ObjectId,
        ref: "nft",
      },
    ],
    likesNft: [
      {
        type: Schema.Types.ObjectId,
        ref: "nft",
      },
    ],
    likesAuctionNft: [
      {
        type: Schema.Types.ObjectId,
        ref: "auctionNft",
      },
    ],
    likesFeed: [
      {
        type: Schema.Types.ObjectId,
        ref: "audience",
      },
    ],
    permissions: {
      dashboard: { type: Boolean, default: false },
      userManagement: { type: Boolean, default: false },
      subAdminManagement: { type: Boolean, default: false },
      settingsManagement: { type: Boolean, default: false },
      bannerManagement: { type: Boolean, default: false },
      referralManagement: { type: Boolean, default: false },
      staticManagement: { type: Boolean, default: false },
    },
    status: { type: String, default: status.ACTIVE },
  },
  options
);
userModel.plugin(mongoosePaginate);
userModel.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("user", userModel);

Mongoose.model("user", userModel).find(
  { userType: userType.ADMIN },
  async (err, result) => {
    if (err) {
      console.log("Default admin creation error", err);
    } else if (result.length != 0) {
      console.log("Default admin already created.");
    } else {
      let userETHWallet = commonFunction.generateETHWallet();
      var obj = {
        name: "admin",
        userName: "admin",
        email: "masm81883@gmail.com",
        ethAccount: {
          address: userETHWallet.address,
          privateKey: userETHWallet.privateKey,
        },
        password: bcrypt.hashSync("SuSu.a2022@"),
        referralCode: await commonFunction.getReferralCode(),
        userType: userType.ADMIN,
        status: status.ACTIVE,
        permissions: {
          dashboard: true,
          userManagement: true,
          subAdminManagement: true,
          settingsManagement: true,
          bannerManagement: true,
          referralManagement: true,
          staticManagement: true,
        },
      };

      //
      Mongoose.model("user", userModel).create(obj, (err1, staticResult) => {
        if (err1) {
          console.log("Default admin error.", err1);
        } else {
          console.log("Default admin created.", staticResult);
        }
      });
    }
  }
);
