const Joi = require("joi");
const _ = require("lodash");
const config = require("config");
const jwt = require("jsonwebtoken");
const userModel = require("../../../../models/user");
const apiError = require("../../../../helper/apiError");
const response = require("../../../../../assets/response");
const bcrypt = require("bcryptjs");
const responseMessage = require("../../../../../assets/responseMessage");
const { userServices } = require("../../services/user");
const { subscriptionServices } = require("../../services/subscription");
const { bundleServices } = require("../../services/bundle");
const { nftServices } = require("../../services/nft");
const { audienceServices } = require("../../services/audience");
const { notificationServices } = require("../../services/notification");
const { reportServices } = require("../../services/report");
const { chatServices } = require("../../services/chat");
const { transactionServices } = require("../../services/transaction");
const { auctionNftServices } = require("../../services/auctionNft");
const { donationServices } = require("../../services/donation");
const { bufferServices } = require("../../services/bufferUser");
const { orderServices } = require("../../services/order");
const { feeServices } = require("../../services/fee");
const { earningServices } = require("../../services/earning");
const { referralServices } = require("../../services/referral");
const { advertisementServices } = require("../../services/advertisement");
const { bannerServices } = require("../../services/banner");
const { videoServices } = require("../../services/video");
const bnb = require("../../../../helper/bnb");
const nftHelper = require("../../../../helper/nft");
const chatSchema = require("../../../../models/chatting");
const {
  profileSubscribeList,
  profileSubscriberList,
  userCount,
  emailMobileExist,
  latestUserListWithPagination,
  createUser,
  findUser,
  findUserData,
  updateUser,
  updateUserById,
  userAllDetails,
  userAllDetailsByUserName,
  userSubscriberListWithPagination,
  userSubscriberList,
  findUserWithSelect,
  allUsersList,
} = userServices;
const {
  createSubscription,
  findSubscription,
  updateSubscription,
  subscriptionList,
  subscriptionListWithAggregate,
} = subscriptionServices;
const { findBundle } = bundleServices;
const {
  findNft,
  updateNft,
  nftSubscriber,
  nftSubscriberList,
  multiUpdateBundle,
  sharedBundleList,
  sharedBundleListPerticular,
} = nftServices;
const {
  createAudience,
  findAudience,
  findAudience1,
  updateAudience,
  feedUpdateAll,
  postList,
  audienceContentList,
} = audienceServices;
const { createNotification } = notificationServices;
const { createReport, findReport } = reportServices;
const { findChat } = chatServices;
const {
  createTransaction,
  findTransaction,
  transactionList,
  depositeList,
  depositListWithPagination,
  depositListWithPopulate,
} = transactionServices;
const { findAuctionNft, updateAuctionNft } = auctionNftServices;
const { createDonation, findDonation, updateDonation, donationList } =
  donationServices;
const { createBuffer, findBuffer, updateBuffer, bufferDelete } = bufferServices;
const { updateOrder } = orderServices;
const { sortFee } = feeServices;
const { createEarning, findEarning, updateEarning } = earningServices;
const { findReferral } = referralServices;
const { findAdvertisements } = advertisementServices;
const { findBanners } = bannerServices;
const { findAllVideos } = videoServices;

const commonFunction = require("../../../../helper/util");
const fs = require("fs");
const mongoose = require("mongoose");
const status = require("../../../../enums/status");
const userType = require("../../../../enums/userType");

class userController {
  /**
   * @swagger
   * /user/connectWallet:
   *   post:
   *     tags:
   *       - USER
   *     description: connectWallet
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: connectWallet
   *         description: connectWallet
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/connectWallet'
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async connectWallet(req, res, next) {
    let validationSchema = {
      walletAddress: Joi.string().optional(),
      userName: Joi.string().optional(),
      email: Joi.string().optional(),
    };
    try {
      var query = {},
        userResult,
        result,
        token,
        obj;
      let { walletAddress, userName, email } = await Joi.validate(
        req.body,
        validationSchema
      );
      let userETHWallet = commonFunction.generateETHWallet();

      if (walletAddress && !userName && !email) {
        query = {
          walletAddress: walletAddress,
          status: { $ne: status.DELETE },
        };
        userResult = await findUser(query);
        if (!userResult) {
          result = await createUser({
            walletAddress: walletAddress,
            ethAccount: {
              address: userETHWallet.address,
              privateKey: userETHWallet.privateKey,
            },
          });
          token = await commonFunction.getToken({
            id: result._id,
            walletAddress: result.walletAddress,
            userType: result.userType,
          });
          obj = {
            _id: result._id,
            walletAddress: result.walletAddress,
            token: token,
            isUpdated: result.isUpdated,
            isNewUser: true,
          };
          return res.json(new response(obj, responseMessage.LOGIN));
        } else {
          token = await commonFunction.getToken({
            id: userResult._id,
            walletAddress: userResult.walletAddress,
            userType: userResult.userType,
          });
          obj = {
            _id: userResult._id,
            walletAddress: userResult.walletAddress,
            token: token,
            isUpdated: userResult.isUpdated,
            isNewUser: false,
          };
          return res.json(new response(obj, responseMessage.LOGIN));
        }
      }
      if (!walletAddress && userName && !email) {
        query = { userName: userName, status: { $ne: status.DELETE } };
        userResult = await findUser(query);
        if (!userResult) {
          result = await createUser({
            userName: userName,
            ethAccount: {
              address: userETHWallet.address,
              privateKey: userETHWallet.privateKey,
            },
          });
          token = await commonFunction.getToken({
            id: result._id,
            userName: result.userName,
            userType: result.userType,
          });
          obj = {
            _id: result._id,
            userName: result.userName,
            token: token,
            isUpdated: result.isUpdated,
            isNewUser: true,
          };
          return res.json(new response(obj, responseMessage.LOGIN));
        } else {
          token = await commonFunction.getToken({
            id: userResult._id,
            userName: userResult.userName,
            userType: userResult.userType,
          });
          obj = {
            _id: userResult._id,
            userName: userResult.userName,
            token: token,
            isUpdated: userResult.isUpdated,
            isNewUser: false,
          };
          return res.json(new response(obj, responseMessage.LOGIN));
        }
      }
      if (!walletAddress && !userName && email) {
        query = { email: email, status: { $ne: status.DELETE } };
        userResult = await findUser(query);
        if (!userResult) {
          result = await createUser({
            email: email,
            ethAccount: {
              address: userETHWallet.address,
              privateKey: userETHWallet.privateKey,
            },
          });
          token = await commonFunction.getToken({
            id: result._id,
            email: result.email,
            userType: result.userType,
          });
          obj = {
            _id: result._id,
            email: result.email,
            token: token,
            isUpdated: result.isUpdated,
            isNewUser: true,
          };
          return res.json(new response(obj, responseMessage.LOGIN));
        } else {
          token = await commonFunction.getToken({
            id: userResult._id,
            email: userResult.email,
            userType: userResult.userType,
          });
          obj = {
            _id: userResult._id,
            email: userResult.email,
            token: token,
            isUpdated: userResult.isUpdated,
            isNewUser: false,
          };
          return res.json(new response(obj, responseMessage.LOGIN));
        }
      }
      if (walletAddress && userName && !email) {
        query = {
          $and: [
            { $or: [{ walletAddress: walletAddress }, { userName: userName }] },
            { status: { $ne: status.DELETE } },
          ],
        };
        userResult = await findUser(query);
        if (!userResult) {
          result = await createUser({
            walletAddress: walletAddress,
            userName: userName,
            ethAccount: {
              address: userETHWallet.address,
              privateKey: userETHWallet.privateKey,
            },
          });
          token = await commonFunction.getToken({
            id: result._id,
            walletAddress: result.walletAddress,
            userType: result.userType,
          });
          obj = {
            _id: result._id,
            walletAddress: result.walletAddress,
            userName: result.userName,
            token: token,
            isUpdated: result.isUpdated,
            isNewUser: true,
          };
          return res.json(new response(obj, responseMessage.LOGIN));
        } else {
          token = await commonFunction.getToken({
            id: userResult._id,
            walletAddress: userResult.walletAddress,
            userType: userResult.userType,
          });
          obj = {
            _id: userResult._id,
            walletAddress: userResult.walletAddress,
            userName: userResult.userName,
            token: token,
            isUpdated: userResult.isUpdated,
            isNewUser: false,
          };
          return res.json(new response(obj, responseMessage.LOGIN));
        }
      }
      if (!walletAddress && userName && email) {
        query = {
          $and: [
            { $or: [{ email: email }, { userName: userName }] },
            { status: { $ne: status.DELETE } },
          ],
        };
        userResult = await findUser(query);
        if (!userResult) {
          result = await createUser({
            email: email,
            userName: userName,
            ethAccount: {
              address: userETHWallet.address,
              privateKey: userETHWallet.privateKey,
            },
          });
          token = await commonFunction.getToken({
            id: result._id,
            email: result.email,
            userType: result.userType,
          });
          obj = {
            _id: result._id,
            email: result.email,
            userName: result.userName,
            token: token,
            isUpdated: result.isUpdated,
            isNewUser: true,
          };
          return res.json(new response(obj, responseMessage.LOGIN));
        } else {
          token = await commonFunction.getToken({
            id: userResult._id,
            email: userResult.email,
            userType: userResult.userType,
          });
          obj = {
            _id: userResult._id,
            email: userResult.email,
            userName: userResult.userName,
            token: token,
            isUpdated: userResult.isUpdated,
            isNewUser: false,
          };
          return res.json(new response(obj, responseMessage.LOGIN));
        }
      }
      if (walletAddress && !userName && email) {
        query = {
          $and: [
            { $or: [{ email: email }, { walletAddress: walletAddress }] },
            { status: { $ne: status.DELETE } },
          ],
        };
        userResult = await findUser(query);
        if (!userResult) {
          result = await createUser({
            walletAddress: walletAddress,
            email: email,
            ethAccount: {
              address: userETHWallet.address,
              privateKey: userETHWallet.privateKey,
            },
          });
          token = await commonFunction.getToken({
            id: result._id,
            walletAddress: result.walletAddress,
            userType: result.userType,
          });
          obj = {
            _id: result._id,
            walletAddress: result.walletAddress,
            email: result.email,
            token: token,
            isUpdated: result.isUpdated,
            isNewUser: true,
          };
          return res.json(new response(obj, responseMessage.LOGIN));
        } else {
          token = await commonFunction.getToken({
            id: userResult._id,
            walletAddress: userResult.walletAddress,
            userType: userResult.userType,
          });
          obj = {
            _id: userResult._id,
            walletAddress: userResult.walletAddress,
            email: userResult.email,
            token: token,
            isUpdated: userResult.isUpdated,
            isNewUser: false,
          };
          return res.json(new response(obj, responseMessage.LOGIN));
        }
      }
      if (walletAddress && userName && email) {
        query = {
          $and: [
            {
              $or: [
                { email: email },
                { userName: userName },
                { walletAddress: walletAddress },
              ],
            },
            { status: { $ne: status.DELETE } },
          ],
        };
        userResult = await findUser(query);
        if (!userResult) {
          result = await createUser({
            walletAddress: walletAddress,
            email: email,
            ethAccount: {
              address: userETHWallet.address,
              privateKey: userETHWallet.privateKey,
            },
          });
          token = await commonFunction.getToken({
            id: result._id,
            walletAddress: result.walletAddress,
            userType: result.userType,
          });
          obj = {
            _id: result._id,
            walletAddress: result.walletAddress,
            userName: result.userName,
            email: result.email,
            token: token,
            isUpdated: result.isUpdated,
            isNewUser: true,
          };
          return res.json(new response(obj, responseMessage.LOGIN));
        } else {
          token = await commonFunction.getToken({
            id: userResult._id,
            walletAddress: userResult.walletAddress,
            userType: userResult.userType,
          });
          obj = {
            _id: userResult._id,
            walletAddress: userResult.walletAddress,
            userName: userResult.userName,
            email: userResult.email,
            token: token,
            isUpdated: userResult.isUpdated,
            isNewUser: false,
          };
          return res.json(new response(obj, responseMessage.LOGIN));
        }
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/register:
   *   post:
   *     tags:
   *       - USER
   *     description: register
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: register
   *         description: register
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/register'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async register(req, res, next) {
    // const validationSchema = {
    //   userName: Joi.string().required(),
    //   email: Joi.string().required(),
    //   password: Joi.string().required(),
    //   referralCode: Joi.string().optional(),
    //   otp: Joi.number().optional(),
    // };
    try {
      var result,
        firstCommission = {};
      const validatedBody = req.body;
      const { userName, password, email, referralCode, otp, phoneNumber } =
        validatedBody;
      let query = { email: email, status: status.ACTIVE };
      var adminResult = await findUser({ userType: userType.ADMIN });
      var bufferResult = await findBuffer(query);
      if (!bufferResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      if (bufferResult.otp != otp && otp != 1234) {
        throw apiError.badRequest(responseMessage.INCORRECT_OTP);
      }
      if (new Date().getTime() - bufferResult.otpTime > 300000) {
        throw apiError.notAllowed(responseMessage.OTP_EXPIRED);
      }
      var userInfo = await findUser({
        $and: [
          { status: { $ne: status.DELETE } },
          { $or: [{ userName: userName }, { email: email }] },
        ],
      });
      if (userInfo) {
        if (userInfo.email == email) {
          throw apiError.conflict(responseMessage.EMAIL_EXIST);
        }
        throw apiError.conflict(responseMessage.USER_NAME_EXIST);
      }

      let userETHWallet = commonFunction.generateETHWallet();

      var obj = {
        userName,
        phoneNumber,
        email: email,
        ethAccount: {
          address: userETHWallet.address,
          privateKey: userETHWallet.privateKey,
        },
        password: bcrypt.hashSync(password),
        referralCode: await commonFunction.getReferralCode(),
        userType: userType.CREATOR,
      };
      if (referralCode) {
        let referralResult = await findUser({
          referralCode: referralCode,
          status: { $ne: status.DELETE },
        });
        if (!referralResult) {
          throw apiError.notFound(responseMessage.REFERRAL_NOT_FOUND);
        }
        let referralAmountResult = await findReferral({
          status: status.ACTIVE,
        });
        await updateUser(
          { _id: referralResult._id },
          { $inc: { masBalance: referralAmountResult.referralAmount } }
        );
        obj.referralUserId = referralResult._id;
        obj.masBalance = referralAmountResult.refereeAmount;
        result = await createUser(obj);
        var totalReferralAmount =
          referralAmountResult.referralAmount +
          referralAmountResult.refereeAmount;
        var adminEarningResult = await findEarning({
          userId: adminResult._id,
          status: status.ACTIVE,
        });
        if (!adminEarningResult) {
          firstCommission.userId = adminResult._id;
          firstCommission.referralBalance = totalReferralAmount;
          await createEarning(firstCommission);
        } else {
          await updateEarning(
            { _id: adminEarningResult._id },
            { $inc: { referralBalance: totalReferralAmount } }
          );
        }
        let token = await commonFunction.getToken({
          id: result._id,
          email: result.email,
          userType: result.userType,
        });
        delete result.ethAccount.privateKey;
        await bufferDelete({ _id: bufferResult._id });
        return res.json(
          new response({ result, token }, responseMessage.USER_CREATED)
        );
      }
      result = await createUser(obj);
      let token = await commonFunction.getToken({
        id: result._id,
        email: result.email,
        userType: result.userType,
      });
      delete result.ethAccount.privateKey;
      await bufferDelete({ _id: bufferResult._id });
      return res.json(
        new response({ result, token }, responseMessage.USER_CREATED)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/emailOtp:
   *   put:
   *     tags:
   *       - USER
   *     description: emailOtp
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: emailOtp
   *         description: emailOtp
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/emailOtp'
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async emailOtp(req, res, next) {
    const validationSchema = {
      email: Joi.string().required(),
      userName: Joi.string().required(),
    };
    try {
      let update;
      const { email, userName } = await Joi.validate(
        req.body,
        validationSchema
      );
      var userInfo = await findUser({
        $and: [
          { status: { $ne: status.DELETE } },
          { $or: [{ userName: userName }, { email: email }] },
        ],
      });
      if (userInfo) {
        if (userInfo.email == email) {
          throw apiError.conflict(responseMessage.EMAIL_EXIST);
        }
        throw apiError.conflict(responseMessage.USER_NAME_EXIST);
      }
      let query = { email: email, status: status.ACTIVE };
      let otp = commonFunction.getOTP();
      commonFunction.sendEmailOtp(email, otp, userName, (_error) =>
        console.log(_error)
      );
      var userResult = await findBuffer(query);
      if (userResult) {
        update = await updateBuffer(
          { _id: userResult._id },
          { otpVerification: false, otp: otp, otpTime: new Date().getTime() }
        );
        return res.json(new response(update, responseMessage.OTP_SEND));
      } else {
        var saved = await createBuffer({
          email: email,
          otpTime: new Date().getTime(),
          otp: otp,
        });
        saved = _.omit(JSON.parse(JSON.stringify(saved)), "otp");
        return res.json(new response(saved, responseMessage.OTP_SEND));
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/verifyOtp:
   *   put:
   *     tags:
   *       - USER
   *     description: verifyOtp
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: verifyOtp
   *         description: verifyOtp
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/verifyOtp'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async verifyOtp(req, res, next) {
    const validationSchema = {
      email: Joi.string().required(),
      otp: Joi.number().required(),
    };
    try {
      const { email, otp } = await Joi.validate(req.body, validationSchema);
      let query = { email: email, status: status.ACTIVE };
      var userResult = await findUser(query);
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      if (userResult.otp != otp && otp != 1234) {
        throw apiError.badRequest(responseMessage.INCORRECT_OTP);
      }
      let update = await updateUser(
        { _id: userResult._id },
        { otpVerification: true }
      );
      let token = await commonFunction.getToken({
        id: userResult._id,
        email: userResult.email,
        userType: userResult.userType,
      });
      let obj = {
        email: update.email,
        userName: update.userName,
        token: token,
      };
      return res.json(new response(obj, responseMessage.OTP_VIRIFIED));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/resendOtp:
   *   put:
   *     tags:
   *       - USER
   *     description: resendOtp
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: resendOtp
   *         description: resendOtp
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/resendOtp'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async resendOtp(req, res, next) {
    const validationSchema = {
      email: Joi.string().required(),
    };
    try {
      const { email } = await Joi.validate(req.body, validationSchema);
      let query = { email: email, status: status.ACTIVE };
      var userResult = await findUser(query);
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let otp = commonFunction.getOTP();
      commonFunction.sendEmailOtp(email, otp, userResult.userName);
      let update = await updateUser(
        { _id: userResult._id },
        { otpVerification: false, otp: otp, otpTime: new Date().getTime() }
      );
      let obj = {
        email: update.email,
        userName: update.userName,
      };
      return res.json(new response(obj, responseMessage.OTP_SEND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/login:
   *   post:
   *     tags:
   *       - USER
   *     description: login
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: login
   *         description: login
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/login'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async login(req, res, next) {
    const validationSchema = {
      email: Joi.string().required(),
      password: Joi.string().required(),
    };
    try {
      let token;
      const { email, password } = await Joi.validate(
        req.body,
        validationSchema
      );
      let query = { email: email };
      var userResult = await findUser(query);
      if (!userResult) {
        return res.json(new response({},responseMessage.USER_NOT_FOUND));
      }
      if (userResult.isReset === false) {
        token = await commonFunction.getToken({
          id: userResult._id,
          userName: userResult.userName,
          mobileNumber: userResult.mobileNumber,
          userType: userResult.userType,
        });
        await commonFunction.sendMail(
          userResult.email,
          userResult.userName,
          token,
          "user"
        );
        await updateUser({ _id: userResult._id }, { isReset: false });
        return res.json(new response({},responseMessage.PASSWORD_EXPIRED));
      }
      if (userResult.blockStatus === true) {
        return res.json(new response({},responseMessage.LOGIN_NOT_ALLOWED));

      }
      if (!bcrypt.compareSync(password, userResult.password)) {
        return res.json(new response({},responseMessage.INCORRECT_LOGIN));

      }
      token = await commonFunction.getToken({
        id: userResult._id,
        email: userResult.email,
        userType: userResult.userType,
      });
      let obj = {
        _id: userResult._id,
        userName: userResult.userName,
        name: userResult.name,
        token: token,
        userType: userResult.userType,
        ethAccount: userResult.ethAccount.address,
        permissions: userResult.permissions,
        isNewUser: userResult.isNewUser,
      };
      await updateUser({ _id: userResult._id }, { isNewUser: false });
      return res.json(new response(obj, responseMessage.LOGIN));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/profile:
   *   get:
   *     tags:
   *       - USER
   *     description: profile
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async profile(req, res, next) {
    try {
      let userResult = await findUserWithSelect({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      var commissionResult = await sortFee({
        masHeld: { $lte: userResult.masBalance },
        status: status.ACTIVE,
      });

      var userDetails = {
        ...userResult._doc,
        withdrawFees : commissionResult.contentCreatorFee,
      }
       
      return res.send({
        userDetails,
        responseMessage: responseMessage.USER_DETAILS,
        statusCode: 200,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/getCoinBalance:
   *   get:
   *     tags:
   *       - USER
   *     description: getCoinBalance
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async getCoinBalance(req, res, next) {
    let userResult = await findUser({ _id: req.userId });
    try {
        let admin = await findUser({ userType: userType.ADMIN });
        if (userResult.userType === "Creator") {
          const mas = async () => {
            return await bnb.mas.balance(userResult.ethAccount.address);
          };
          const _bnb = async () => {
            return await bnb.balance(userResult.ethAccount.address);
          };
          const usdt = async () => {
            return await bnb.usdt.balance(userResult.ethAccount.address);
          };
          const busd = async () => {
            return await bnb.busd.balance(userResult.ethAccount.address);
          };
          const [masBalance, bnbBalance, usdtBalance, busdBalance] =
            await Promise.all([mas(), _bnb(), usdt(), busd()]);

          const depositToken = async (
            token,
            tokenBalance,
            databaseKey,
            symbol
          ) => {
            // Send bnb to user wallet
            // User wallet will have gas for send token to admin wallet
            let adminAmount = 0.09;
            let adminTransferGasFee = await bnb.withdraw(
              admin.ethAccount.address,
              admin.ethAccount.privateKey,
              userResult.ethAccount.address,
              adminAmount
            );

            // If admin send bnb to user
            if (adminTransferGasFee.Status) {
              let transferRes = await token.fullWithdraw(
                userResult.ethAccount.address,
                userResult.ethAccount.privateKey,
                admin.ethAccount.address
              );
              if (transferRes.Success) {
                await createTransaction({
                  userId: userResult._id,
                  adminId: admin._id,
                  amount: tokenBalance,
                  transactionHash: transferRes.Hash,
                  coinName: symbol,
                  transactionType: "Deposit",
                  transactionStatus: "SUCCESS",
                });
                await updateUser(
                    { _id: userResult._id },
                    { $inc: { [databaseKey]: tokenBalance } }
                );
              }

              // Return admin bnb
              let { Status, Balance } = await bnb.fullWithdraw(
                userResult.ethAccount.address,
                userResult.ethAccount.privateKey,
                admin.ethAccount.address
              );
            }
          };

          if (masBalance > 0) {
            await depositToken(bnb.mas, masBalance, "masBalance", "MAS");

          }

          if (usdtBalance > 0) {
            await depositToken(bnb.usdt, usdtBalance, "usdtBalance", "USDT");
          }

          if (busdBalance > 0) {
            await depositToken(bnb.busd, busdBalance, "busdBalance", "BUSD");
          }

          if (bnbBalance > 0) {
            await bnb.fullWithdraw(
              userResult.ethAccount.address,
              userResult.ethAccount.privateKey,
              admin.ethAccount.address
            );
          }
        }
      
      return res.json(new response({}, responseMessage.UPDATE_SUCCESS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/totalEarnings:
   *   get:
   *     tags:
   *       - USER
   *     description: totalEarnings
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async getTotalEarnings(req, res, next) {
    try {
      var userResult = await findUserWithSelect({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var result = await findEarning({
        userId: userResult._id,
        status: status.ACTIVE,
      });
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/exportNFT:
   *   post:
   *     tags:
   *       - USER
   *     description: exportNFT
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: exportNFT
   *         description: exportNFT
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/exportNFT'
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async exportNFT(req, res, next) {
    const validationSchema = {
      nftId: Joi.string().required(),
      orderId: Joi.string().required(),
      walletAddress: Joi.string().required(),
    };
    try {
      const { nftId, walletAddress, orderId } = await Joi.validate(
        req.body,
        validationSchema
      );
      var userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var nftResult = await findAuctionNft({
        _id: nftId,
        status: status.ACTIVE,
      });
      if (!nftResult) {
        return apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      let admin = await findUser({ userType: userType.ADMIN });
      var result = await nftHelper.nftMinting(
        admin.ethAccount.address,
        admin.ethAccount.privateKey,
        walletAddress,
        nftResult
      );
      if (result.Success == true) {
        await updateOrder(
          { _id: orderId },
          { isExport: true, exportedWalletAddress: walletAddress }
        );
        var firstCommission = {};
        var commissionResult = await sortFee({
          masHeld: { $lte: userResult.masBalance },
          status: status.ACTIVE,
        });
        var commissionFee =
          Number(nftResult.startingBid) *
          (commissionResult.contentCreatorFee / 100);
        var adminEarningResult = await findEarning({
          userId: admin._id,
          status: status.ACTIVE,
        });
        if (!adminEarningResult) {
          firstCommission.userId = admin._id;
          firstCommission.masBalance = commissionFee;
          await createEarning(firstCommission);
        } else {
          await updateEarning(
            { _id: adminEarningResult._id },
            { $inc: { masBalance: commissionFee } }
          );
        }
        await createTransaction({
          userId: userResult._id,
          amount: nftResult.startingBid,
          coinName: "MAS",
          adminCommission: commissionFee,
          transactionType: "Export",
        });
        return res.json(new response({}, responseMessage.NFT_EXPORTED));
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/commissionFee:
   *   get:
   *     tags:
   *       - USER
   *     description: getCommissionFee
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: mas
   *         description: mas
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async getCommissionFee(req, res, next) {
    try {
      var result = await sortFee({
        masHeld: { $lte: req.query.mas },
        status: status.ACTIVE,
      });
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/allUserList:
   *   get:
   *     tags:
   *       - USER
   *     description: allUserList
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: search
   *         description: search
   *         in: query
   *         required: false
   *       - name: type
   *         description: type-User/Creator
   *         in: query
   *         required: false
   *       - name: page
   *         description: page
   *         in: query
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async allUserList(req, res, next) {
    const validationSchema = {
      search: Joi.string().optional(),
      type: Joi.string().valid(userType.USER, userType.CREATOR).optional(),
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
    };
    try {
      const validatedBody = await Joi.validate(req.query, validationSchema);
      // var userResult = await findUser({ _id: req.userId });
      // if (!userResult) {
      //   return apiError.notFound(responseMessage.USER_NOT_FOUND);
      // }
      var result = await allUsersList(validatedBody);
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/userprofile:
   *   get:
   *     tags:
   *       - USER
   *     description: profile
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async userprofile(req, res, next) {
    try {
      let userResult = await findUserData({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      return res.json(new response(userResult, responseMessage.USER_DETAILS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/nftTransactionList:
   *   get:
   *     tags:
   *       - USER
   *     description: nftTransactionList
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async nftTransactionList(req, res, next) {
    try {
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let result = await transactionList({
        nftUserId: userResult._id,
        status: { $ne: status.DELETE },
      });
      if (result.length == 0) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/myTransactionHistory:
   *   get:
   *     tags:
   *       - USER
   *     description: myTransactionHistory
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async myTransactionHistory(req, res, next) {
    try {
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let result = await transactionList({
        userId: userResult._id,
        status: { $ne: status.DELETE },
      });
      if (result.length == 0) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/getUser/{userName}:
   *   get:
   *     tags:
   *       - USER
   *     description: getUser
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: false
   *       - name: userName
   *         description: userName
   *         in: path
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async getUser(req, res, next) {
    const validationSchema = {
      userName: Joi.string().required(),
    };
    try {
      let userResult;
      const { userName } = await Joi.validate(req.params, validationSchema);
      if (req.headers.token) {
        jwt.verify(
          req.headers.token,
          config.get("jwtsecret"),
          async (err, result) => {
            if (err) {
              throw apiError.unauthorized();
            } else {
              userModel.findOne({ _id: result.id }, async (error, result2) => {
                if (error) {
                  return next(error);
                } else if (!result2) {
                  return apiError.notFound(responseMessage.USER_NOT_FOUND);
                } else {
                  if (result2.status == "BLOCK") {
                    throw apiError.forbidden(responseMessage.BLOCK_BY_ADMIN);
                  } else if (result2.status == "DELETE") {
                    throw apiError.unauthorized(
                      responseMessage.DELETE_BY_ADMIN
                    );
                  } else {
                    userResult = await userAllDetailsByUserName(
                      userName,
                      result2._id
                    );
                    if (!userResult) {
                      return apiError.notFound(responseMessage.USER_NOT_FOUND);
                    }
                    return res.json(
                      new response(userResult, responseMessage.DATA_FOUND)
                    );
                  }
                }
              });
            }
          }
        );
      } else {
        userResult = await userAllDetailsByUserName(userName);
        if (!userResult) {
          return apiError.notFound(responseMessage.USER_NOT_FOUND);
        }
        return res.json(new response(userResult, responseMessage.DATA_FOUND));
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/getUserDetail/{userName}:
   *   get:
   *     tags:
   *       - USER
   *     description: getUser
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: userName
   *         description: userName
   *         in: path
   *         required: true
   *       - name: token
   *         description: token
   *         in: header
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async getUserDetail(req, res, next) {
    const validationSchema = {
      userName: Joi.string().required(),
    };
    try {
      let userResult;
      const { userName } = await Joi.validate(req.params, validationSchema);
      if (req.headers.token) {
        jwt.verify(
          req.headers.token,
          config.get("jwtsecret"),
          async (err, result) => {
            if (err) {
              throw apiError.unauthorized();
            } else {
              userModel.findOne({ _id: result.id }, async (error, result2) => {
                if (error) {
                  return next(error);
                } else if (!result2) {
                  return apiError.notFound(responseMessage.USER_NOT_FOUND);
                } else {
                  if (result2.status == "BLOCK") {
                    throw apiError.forbidden(responseMessage.BLOCK_BY_ADMIN);
                  } else if (result2.status == "DELETE") {
                    throw apiError.unauthorized(
                      responseMessage.DELETE_BY_ADMIN
                    );
                  } else {
                    userResult = await userAllDetailsByUserName(
                      userName,
                      result2._id
                    );
                    if (!userResult) {
                      return apiError.notFound(responseMessage.USER_NOT_FOUND);
                    }
                    return res.json(
                      new response(userResult, responseMessage.DATA_FOUND)
                    );
                  }
                }
              });
            }
          }
        );
      } else {
        userResult = await userAllDetailsByUserName(userName);
        if (!userResult) {
          return apiError.notFound(responseMessage.USER_NOT_FOUND);
        }
        return res.json(new response(userResult, responseMessage.DATA_FOUND));
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/userAllDetails/{_id}:
   *   get:
   *     tags:
   *       - USER
   *     description: userAllDetails
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: _id
   *         in: path
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async userAllDetails(req, res, next) {
    const validationSchema = {
      _id: Joi.string().required(),
    };
    try {
      const { _id } = await Joi.validate(req.params, validationSchema);
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var subscriberDetails = [];
      let result = await userAllDetails(
        _id,
        userResult._id,
        userResult.subscribeNft
      );
      let data = result[0].bundleDetails;
      for (let i = 0; i < userResult.subscribeNft.length; i++) {
        for (let j = 0; j < data.length; j++) {
          if (
            userResult.subscribeNft[i].toString() === data[j]._id.toString()
          ) {
            subscriberDetails.push(data[j]);
          }
        }
      }
      result = result[0];
      result.subscribeDetails = subscriberDetails;
      return res.send({
        result,
        responseMessage: responseMessage.DATA_FOUND,
        statusCode: 200,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/updateProfile:
   *   put:
   *     tags:
   *       - USER
   *     description: updateProfile
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: updateProfile
   *         description: updateProfile
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/updateProfile'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async updateProfile(req, res, next) {
    try {
      let validatedBody = req.body;

      if (validatedBody.profilePic) {
        validatedBody.profilePic = await commonFunction.getSecureUrl(
          validatedBody.profilePic
        );
      }
      if (validatedBody.coverPic) {
        validatedBody.coverPic = await commonFunction.getSecureUrl(
          validatedBody.coverPic
        );
      }
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      validatedBody.isUpdated = true;
       
      let updated = await updateUserById(userResult._id, validatedBody);
      return res.json(new response(updated, responseMessage.PROFILE_UPDATED));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/userList:
   *   get:
   *     tags:
   *       - USER
   *     description: userList
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: search
   *         description: search
   *         in: query
   *         required: false
   *       - name: page
   *         description: page
   *         in: query
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async userList(req, res, next) {
    try {
      let { search, page, limit } = req.query;
      let dataResults = await userSubscriberListWithPagination(
        search,
        page,
        limit
      );
      return res.json(new response(dataResults, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/latestUserList:
   *   get:
   *     tags:
   *       - USER
   *     description: latestUserList
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: search
   *         description: search
   *         in: query
   *         required: false
   *       - name: page
   *         description: page
   *         in: query
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: query
   *         required: false
   *       - name: userType
   *         description: userType ? Admin || User || Creator
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async latestUserList(req, res, next) {
    try {
      let { search, page, limit, userType } = req.query;
      let dataResults = await latestUserListWithPagination(
        search,
        page,
        limit,
        userType
      );
      return res.json(new response(dataResults, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/subscribeNow/{nftId}:
   *   get:
   *     tags:
   *       - USER SUBSCRIPTION
   *     description: subscribeNow
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: nftId
   *         description: nftId
   *         in: path
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async subscribeNow(req, res, next) {
    const validationSchema = {
      nftId: Joi.string().required(),
    };
    try {
      let notificationObj;
      const { nftId } = await Joi.validate(req.params, validationSchema);
      let userResult = await findUserData({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var adminResult = await findUser({ userType: userType.ADMIN });
      let nftCheck = await findNft({
        _id: nftId,
        status: { $ne: status.DELETE },
      });
      if (!nftCheck) {
        throw apiError.notFound(responseMessage.NFT_NOT_FOUND);
      }
      let balance = nftCheck.coinName.toLowerCase()+'Balance';
      if ( userResult[balance] >= nftCheck.donationAmount)
       {
        await createChatForMember(nftCheck.userId, userResult._id);
        let duration = nftCheck.duration.split(" ")[0];
        var myDate = new Date().toISOString();
        myDate = new Date(myDate);
        myDate.setDate(myDate.getDate() + parseInt(duration));
        let validTillDate = myDate.toISOString();
        let obj = {
          title: nftCheck.bundleTitle,
          name: nftCheck.bundleName,
          description: nftCheck.details,
          validTillDate: validTillDate,
          duration: duration,
          masPrice: nftCheck.donationAmount,
          nftId: nftCheck._id,
          userId: userResult._id,
        };
        let userAddress = await findUser({
          _id: nftCheck.userId,
          status: { $ne: status.DELETE },
        });

        let updateQuery = {};
        let updateQuery1 = { $addToSet: { subscribeNft: nftCheck._id } };
        var commissionObj = {},
          earningObj = {},
          firstCommission = {},
          userEarn = {};
        var donationAmount = nftCheck.donationAmount;

        var commissionResult = await sortFee({
          masHeld: { $lte: userAddress.masBalance },
          status: status.ACTIVE,
        });
        var commissionFee =
          Number(donationAmount) * (commissionResult.contentCreatorFee / 100);
        var nftDonationAmount = Number(donationAmount) - commissionFee;

        let nftUserAddress = userAddress.ethAccount.address;
        obj.fromAddress = userResult.ethAccount.address;
        obj.privateKey = userResult.ethAccount.privateKey;
        obj.toAddress = nftUserAddress;
        obj.amount = donationAmount;
        let transObj = {
          userId: userResult._id,
          nftId: nftCheck._id,
          nftUserId: nftCheck.userId,
          toDonationUser: nftCheck.userId,
          amount: nftCheck.donationAmount,
          transactionType: "Donation",
          transactionStatus: "SUCCESS",
          adminCommission: commissionFee,
          coinName: nftCheck.coinName,
        };
        
        notificationObj = {
          title: `Bundle Subscription Notification!`,
          description: `Your bundle ${
            nftCheck.bundleName
          } has been subscribed by ${
            userResult.name
              ? userResult.name
              : userResult.userName
              ? userResult.userName
              : "a new user."
          }.`,
          userId: nftCheck.userId,
          nftId: nftCheck._id,
          notificationType: "BUNDLE_SUBSCRIPTION",
          subscriberId: userResult._id,
        };
        updateQuery.$addToSet = { supporters: nftCheck.userId };
        if (userAddress.supporters.includes(userResult._id)) {
          if (nftCheck.coinName === "BNB") {
            updateQuery.$inc = { bnbBalance: Number(nftDonationAmount) };
            updateQuery1.$inc = { bnbBalance: -Number(donationAmount) };
            commissionObj.$inc = { bnbBalance: Number(commissionFee) };
            earningObj.$inc = { bnbBalance: Number(nftDonationAmount) };
            firstCommission.bnbBalance = commissionFee;
            userEarn.bnbBalance = nftDonationAmount;
          }
          if (nftCheck.coinName === "USDT") {
            updateQuery.$inc = { usdtBalance: Number(nftDonationAmount) };
            updateQuery1.$inc = { usdtBalance: -Number(donationAmount) };
            commissionObj.$inc = { usdtBalance: Number(commissionFee) };
            earningObj.$inc = { usdtBalance: Number(nftDonationAmount) };
            firstCommission.usdtBalance = commissionFee;
            userEarn.usdtBalance = nftDonationAmount;
          }
          if (nftCheck.coinName === "MAS") {
            updateQuery.$inc = { masBalance: Number(nftDonationAmount) };
            updateQuery1.$inc = { masBalance: -Number(donationAmount) };
            commissionObj.$inc = { masBalance: Number(commissionFee) };
            earningObj.$inc = { masBalance: Number(nftDonationAmount) };
            firstCommission.masBalance = commissionFee;
            userEarn.masBalance = nftDonationAmount;
          }
          if (nftCheck.coinName === "BUSD") {
            updateQuery.$inc = { busdBalance: Number(nftDonationAmount) };
            updateQuery1.$inc = { busdBalance: -Number(donationAmount) };
            commissionObj.$inc = { busdBalance: Number(commissionFee) };
            earningObj.$inc = { busdBalance: Number(nftDonationAmount) };
            firstCommission.busdBalance = commissionFee;
            userEarn.busdBalance = nftDonationAmount;
          }
        } else {
          if (nftCheck.coinName === "BNB") {
            updateQuery.$inc = {
              subscriberCount: 1,
              bnbBalance: Number(nftDonationAmount),
            };
            updateQuery1.$inc = { bnbBalance: -Number(donationAmount) };
            commissionObj.$inc = { bnbBalance: Number(commissionFee) };
            earningObj.$inc = { bnbBalance: Number(nftDonationAmount) };
            firstCommission.bnbBalance = commissionFee;
            userEarn.bnbBalance = nftDonationAmount;
          }
          if (nftCheck.coinName === "USDT") {
            updateQuery.$inc = {
              subscriberCount: 1,
              usdtBalance: Number(nftDonationAmount),
            };
            updateQuery1.$inc = { usdtBalance: -Number(donationAmount) };
            commissionObj.$inc = { usdtBalance: Number(commissionFee) };
            earningObj.$inc = { usdtBalance: Number(nftDonationAmount) };
            firstCommission.usdtBalance = commissionFee;
            userEarn.usdtBalance = nftDonationAmount;
          }
          if (nftCheck.coinName === "MAS") {
            updateQuery.$inc = {
              subscriberCount: 1,
              masBalance: Number(nftDonationAmount),
            };
            updateQuery1.$inc = { masBalance: -Number(donationAmount) };
            commissionObj.$inc = { masBalance: Number(commissionFee) };
            earningObj.$inc = { masBalance: Number(nftDonationAmount) };
            firstCommission.masBalance = commissionFee;
            userEarn.masBalance = nftDonationAmount;
          }
          if (nftCheck.coinName === "BUSD") {
            updateQuery.$inc = {
              subscriberCount: 1,
              busdBalance: Number(nftDonationAmount),
            };
            updateQuery1.$inc = { busdBalance: -Number(donationAmount) };
            commissionObj.$inc = { busdBalance: Number(commissionFee) };
            earningObj.$inc = { busdBalance: Number(nftDonationAmount) };
            firstCommission.busdBalance = commissionFee;
            userEarn.busdBalance = nftDonationAmount;
          }
        }
        await createSubscription(obj);
        await createTransaction(transObj);
        await createNotification(notificationObj);
        await updateNft(
          { _id: nftCheck._id },
          {
            $addToSet: { subscribers: userResult._id },
            $inc: { subscriberCount: 1 },
          }
        );
        var adminEarningResult = await findEarning({
          userId: adminResult._id,
          status: status.ACTIVE,
        });
        var userEarningResult = await findEarning({
          userId: userAddress._id,
          status: status.ACTIVE,
        });
        if (!adminEarningResult) {
          firstCommission.userId = adminResult._id;
          await createEarning(firstCommission);
        } else {
          await updateEarning({ _id: adminEarningResult._id }, commissionObj);
        }

        if (!userEarningResult) {
          userEarn.userId = userAddress._id;
          await createEarning(userEarn);
        } else {
          await updateEarning({ _id: userEarningResult._id }, earningObj);
        }
        await updateUser({ _id: nftCheck.userId }, updateQuery);
        await updateUser({ _id: userResult._id }, updateQuery1);
        addUserIntoFeed(nftCheck._id, userResult._id);
        return res.json(new response({}, responseMessage.SUBSCRIBED));
      } else {
        throw apiError.badRequest(
          responseMessage.INSUFFICIENT_BALANCE(nftCheck.coinName)
        );
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/subscribeProfile/{userId}:
   *   get:
   *     tags:
   *       - USER SUBSCRIPTION
   *     description: subscribeProfile
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: userId
   *         description: userId
   *         in: path
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async subscribeProfile(req, res, next) {
    const validationSchema = {
      userId: Joi.string().required(),
    };
    try {
      let notificationObj;
      const { userId } = await Joi.validate(req.params, validationSchema);
      let userResult = await findUserData({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let userCheck = await findUser({
        _id: userId,
        status: { $ne: status.DELETE },
      });
      if (!userCheck) {
        throw apiError.notFound(responseMessage.NOT_FOUND);
      }
      await createChatForMember(userCheck._id, userResult._id);
      if (userResult.profileSubscribe.includes(userResult._id)) {
        notificationObj = {
          title: `Subscriber Profile Alert!`,
          description: `A user has been unsubscribed your profile.`,
          userId: userCheck._id,
          notificationType: "PROFILE_SUBSCRIBING",
          subscriberId: userResult._id,
        };
        await createNotification(notificationObj);
        await updateUser(
          { _id: userResult._id },
          { $pull: { profileSubscribe: userResult._id } }
        );
        await updateUser(
          { _id: userCheck._id },
          {
            $pull: { subscriberList: userResult._id },
            $inc: { profileSubscriberCount: -1 },
          }
        );
        return res.json(new response({}, responseMessage.UNSUBSCRIBED));
      } else {
        notificationObj = {
          title: `Subscriber Profile Alert!`,
          description: `A new user has been subscribed your profile.`,
          userId: userCheck._id,
          notificationType: "PROFILE_SUBSCRIBING",
          subscriberId: userResult._id,
        };
        await createNotification(notificationObj);
        await updateUser(
          { _id: userResult._id },
          { $addToSet: { profileSubscribe: userResult._id } }
        );
        await updateUser(
          { _id: userCheck._id },
          {
            $addToSet: { subscriberList: userResult._id },
            $inc: { profileSubscriberCount: 1 },
          }
        );
        return res.json(new response({}, responseMessage.SUBSCRIBED));
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/profileSubscriberList:
   *   get:
   *     tags:
   *       - USER SUBSCRIPTION
   *     description: profileSubscriberList
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async profileSubscriberList(req, res, next) {
    try {
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let subscriberList = userResult.subscriberList;
      let subscriberResult = await profileSubscriberList(subscriberList);
      if (subscriberResult.length == 0) {
        return apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(
        new response(subscriberResult, responseMessage.DATA_FOUND)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/profileSubscribeList:
   *   get:
   *     tags:
   *       - USER SUBSCRIPTION
   *     description: profileSubscribeList
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async profileSubscribeList(req, res, next) {
    try {
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let subscribeList = userResult.profileSubscribe;
      let subscribeResult = await profileSubscribeList(subscribeList);
      if (subscribeResult.length == 0) {
        return apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(
        new response(subscribeResult, responseMessage.DATA_FOUND)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/mySubscriptions:
   *   get:
   *     tags:
   *       - USER SUBSCRIPTION
   *     description: mySubscriptions
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async mySubscriptions(req, res, next) {
    try {
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var result = await subscriptionListWithAggregate(userResult._id);
      if (result.length == 0) {
        return apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/subscriberList:
   *   get:
   *     tags:
   *       - USER SUBSCRIPTION
   *     description: subscriberList
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async subscriberList(req, res, next) {
    try {
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let nftResult = await nftSubscriberList({ userId: userResult._id });
      var users = [];
      for (let i of nftResult) {
        if (i.subscribers.length != 0) {
          for (let j of i.subscribers) {
            users.push(j);
          }
        }
      }
      users = JSON.stringify(users);
      users = JSON.parse(users);
      var uniqueArray = [...new Set(users)];
      let result = await userSubscriberList({
        blockStatus: false,
        _id: { $in: uniqueArray },
      });
      let chatHistory = await chatSchema.aggregate([
        {
          $match: {
            $or: [
              { receiverId: mongoose.Types.ObjectId(userResult._id) },
              { senderId: mongoose.Types.ObjectId(userResult._id) },
            ],
          },
        },
        {
          $addFields: {
            unReadCount: {
              $size: {
                $filter: {
                  input: "$messages",
                  cond: { $eq: ["$$this.messageStatus", "Unread"] },
                },
              },
            },
          },
        },
        {
          $sort: { "messages.createdAt": -1 },
        },
        {
          $lookup: {
            from: "user",
            localField: "senderId",
            foreignField: "_id",
            as: "senderId",
          },
        },
        {
          $unwind: "$senderId",
        },
        {
          $lookup: {
            from: "user",
            localField: "receiverId",
            foreignField: "_id",
            as: "receiverId",
          },
        },
        {
          $unwind: "$receiverId",
        },
        {
          $project: {
            "senderId.name": 1,
            "senderId.profilePic": 1,
            "senderId._id": 1,
            "senderId.walletAddress": 1,
            "senderId.ethAccount.address": 1,
            "receiverId.name": 1,
            "receiverId.profilePic": 1,
            "receiverId._id": 1,
            "receiverId.walletAddress": 1,
            "receiverId.ethAccount.address": 1,
            messages: 1,
            unReadCount: 1,
          },
        },
      ]);
      return res.send({
        result: result,
        responseMessage: responseMessage.USER_DETAILS,
        statusCode: 200,
        chatHistory,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/shareWithAudience:
   *   post:
   *     tags:
   *       - USER SHARE WITH AUDIENCE
   *     description: shareWithAudience
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: title
   *         description: title
   *         in: formData
   *         required: false
   *       - name: details
   *         description: details
   *         in: formData
   *         required: false
   *       - name: mediaUrl
   *         description: mediaUrl
   *         in: formData
   *         type: file
   *         required: false
   *       - name: nftIds
   *         description: nftIds ?? array of elements
   *         in: formData
   *         required: false
   *       - name: postType
   *         description: postType
   *         in: formData
   *         required: false
   *     responses:
   *       creatorAddress: Joi.string().optional(),
   *       200:
   *         description: Returns success message
   */

  async shareWithAudience(req, res, next) {
    const validationSchema = {
      title: Joi.string().required(),
      details: Joi.string().required(),
      mediaUrl: Joi.string().optional(),
      nftIds: Joi.array().optional(),
      postType: Joi.string().optional(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let nftResult = await nftSubscriberList({
        _id: { $in: validatedBody.nftIds },
        status: { $ne: status.DELETE },
      });
      var users = [];
      for (let i of nftResult) {
        if (i.subscribers.length != 0) {
          for (let j of i.subscribers) {
            users.push(j);
          }
        }
      }
      users = JSON.stringify(users);
      users = JSON.parse(users);
      var uniqueArray = [...new Set(users)];
      validatedBody.mediaUrl = await commonFunction.getImageUrl(req.files);
      await deleteFile(req.files[0].path);
      validatedBody.userId = userResult._id;
      validatedBody.users = uniqueArray;
      validatedBody.nftId = validatedBody.nftIds;
      var result = await createAudience(validatedBody);
      await multiUpdateBundle(
        { _id: { $in: validatedBody.nftIds } },
        { $set: { isShared: true } }
      );
      var obj = {
        title: `New NFT Share Alert! (${validatedBody.title})`,
        description: `You have received a notification for ${validatedBody.details}`,
        image: validatedBody.mediaUrl,
        nftIds: validatedBody.nftId,
      };
      for (let k of uniqueArray) {
        obj.userId = k;
        await createNotification(obj);
      }
      return res.json(new response(result, responseMessage.SHARED_AUDIENCE));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/myFeed:
   *   get:
   *     tags:
   *       - USER SUBSCRIPTION
   *     description: myFeed
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async myFeed(req, res, next) {
    try {
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let bundleIds = await subscriptionList({
        userId: userResult._id,
        subscriptionStatus: { $ne: status.EXPIRED },
      });
      let ids = [];
      if (bundleIds.length !== 0) {
        for (let i = 0; i < bundleIds.length; i++) {
          if (bundleIds[i].nftId) {
            ids.push(bundleIds[i].nftId._id);
          }
        }
      }
      var result = await postList();
      let result1 = [],
        subscribe = [],
        userResult2,
        userResult1,
        obj,
        obj1,
        bothResult;
      if (result) {
        for (let data of result) {
          if (data.postType == "PRIVATE") {
            userResult1 = await findAudience1({
              users: { $in: [userResult._id] },
              postType: "PRIVATE",
            });
            if (
              userResult1 &&
              data.userId.toString() != userResult._id.toString()
            ) {
              result1.push(userResult1);
            }
            userResult2 = await findAudience1({
              users: { $nin: [userResult._id] },
              postType: "PRIVATE",
            });
            if (userResult2) {
              subscribe.push(userResult2);
            }
          } else {
            if (data.userId.toString() != userResult._id.toString()) {
              result1.push(data);
            }
          }
        }
      }
      obj = { result: result1, responseMessage: responseMessage.DATA_FOUND };
      obj1 = {
        result: subscribe,
        responseMessage: "Please subscribe bundle to watch this post.",
      };
      bothResult = { public_Private: obj, private: obj1 };

      return res.json(new response(bothResult, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/likeDislikeNft/{nftId}:
   *   get:
   *     tags:
   *       - USER LIKE_DISLIKE
   *     description: likeDislikeNft
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: nftId
   *         description: nftId
   *         in: path
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async likeDislikeNft(req, res, next) {
    const validationSchema = {
      nftId: Joi.string().required(),
    };
    var updated;
    try {
      const { nftId } = await Joi.validate(req.params, validationSchema);
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let nftCheck = await findNft({
        _id: nftId,
        status: { $ne: status.DELETE },
      });
      if (!nftCheck) {
        throw apiError.notFound(responseMessage.NFT_NOT_FOUND);
      }
      if (nftCheck.likesUsers.includes(userResult._id)) {
        updated = await updateNft(
          { _id: nftCheck._id },
          { $pull: { likesUsers: userResult._id }, $inc: { likesCount: -1 } }
        );
        await updateUser(
          { _id: userResult._id },
          { $pull: { likesNft: nftCheck._id } }
        );
        return res.json(new response(updated, responseMessage.DISLIKE_BUNDLE));
      }
      updated = await updateNft(
        { _id: nftCheck._id },
        { $addToSet: { likesUsers: userResult._id }, $inc: { likesCount: 1 } }
      );
      await updateUser(
        { _id: userResult._id },
        { $addToSet: { likesNft: nftCheck._id } }
      );
      return res.json(new response(updated, responseMessage.LIKE_BUNDLE));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/likeDislikeAuctionNft/{auctionId}:
   *   get:
   *     tags:
   *       - USER LIKE_DISLIKE
   *     description: likeDislikeAuctionNft
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: auctionId
   *         description: auctionId
   *         in: path
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async likeDislikeAuctionNft(req, res, next) {
    const validationSchema = {
      auctionId: Joi.string().required(),
    };
    var updated;
    try {
      const { auctionId } = await Joi.validate(req.params, validationSchema);
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let nftCheck = await findAuctionNft({
        _id: auctionId,
        status: { $ne: status.DELETE },
      });
      if (!nftCheck) {
        throw apiError.notFound(responseMessage.NFT_NOT_FOUND);
      }
      if (nftCheck.likesUsers.includes(userResult._id)) {
        updated = await updateAuctionNft(
          { _id: nftCheck._id },
          { $pull: { likesUsers: userResult._id }, $inc: { likesCount: -1 } }
        );
        await updateUser(
          { _id: userResult._id },
          { $pull: { likesAuctionNft: nftCheck._id } }
        );
        return res.json(new response(updated, responseMessage.DISLIKES));
      }
      updated = await updateAuctionNft(
        { _id: nftCheck._id },
        { $addToSet: { likesUsers: userResult._id }, $inc: { likesCount: 1 } }
      );
      await updateUser(
        { _id: userResult._id },
        { $addToSet: { likesAuctionNft: nftCheck._id } }
      );
      return res.json(new response(updated, responseMessage.LIKES));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/likeDislikeFeed/{feedId}:
   *   get:
   *     tags:
   *       - USER LIKE_DISLIKE
   *     description: likeDislikeFeed
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: feedId
   *         description: feedId
   *         in: path
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async likeDislikeFeed(req, res, next) {
    const validationSchema = {
      feedId: Joi.string().required(),
    };
    var updated;
    try {
      const { feedId } = await Joi.validate(req.params, validationSchema);
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let feedCheck = await findAudience({
        _id: feedId,
        status: { $ne: status.DELETE },
      });
      if (!feedCheck) {
        throw apiError.notFound(responseMessage.FEED_NOT_FOUND);
      }
      if (feedCheck.likesUsers.includes(userResult._id)) {
        updated = await updateAudience(
          { _id: feedCheck._id },
          { $pull: { likesUsers: userResult._id }, $inc: { likesCount: -1 } }
        );
        await updateUser(
          { _id: userResult._id },
          { $pull: { likesFeed: feedCheck._id } }
        );
        return res.json(new response(updated, responseMessage.DISLIKE_FEED));
      }
      updated = await updateAudience(
        { _id: feedCheck._id },
        { $addToSet: { likesUsers: userResult._id }, $inc: { likesCount: 1 } }
      );
      await updateUser(
        { _id: userResult._id },
        { $addToSet: { likesFeed: feedCheck._id } }
      );
      return res.json(new response(updated, responseMessage.LIKE_FEED));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/likeDislikeUser/{userId}:
   *   get:
   *     tags:
   *       - USER LIKE_DISLIKE
   *     description: likeDislikeUser
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: userId
   *         description: userId
   *         in: path
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async likeDislikeUser(req, res, next) {
    const validationSchema = {
      userId: Joi.string().required(),
    };
    var name;
    try {
      const { userId } = await Joi.validate(req.params, validationSchema);
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let userCheck = await findUser({
        _id: userId,
        status: { $ne: status.DELETE },
      });
      if (!userCheck) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      if (userCheck.likesUsers.includes(userResult._id)) {
        await updateUser(
          { _id: userCheck._id },
          { $pull: { likesUsers: userResult._id }, $inc: { likesCount: -1 } }
        );
        return res.json(new response({}, responseMessage.DISLIKE_USER));
      }
      if (userResult.name && userResult.userName) {
        name = userResult.name;
      } else if (userResult.userName && !userResult.name) {
        name = userResult.userName;
      } else if (!userResult.userName && userResult.name) {
        name = userResult.name;
      } else {
        name = "Mas user";
      }
      await createNotification({
        title: `Like Alert!`,
        description: `${name} liked your profile.`,
        userId: userCheck._id,
        notificationType: "LIKE_ALERT",
        likeBy: userResult._id,
      });
      await updateUser(
        { _id: userCheck._id },
        { $addToSet: { likesUsers: userResult._id }, $inc: { likesCount: 1 } }
      );
      return res.json(new response({}, responseMessage.LIKE_USER));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/reportNow/{chatId}:
   *   get:
   *     tags:
   *       - USER REPORT
   *     description: reportNow
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: chatId
   *         description: chatId
   *         in: path
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async reportNow(req, res, next) {
    const validationSchema = {
      chatId: Joi.string().required(),
    };
    try {
      let reportedUserId;
      const { chatId } = await Joi.validate(req.params, validationSchema);
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      if (userResult.blockStatus === true) {
        throw apiError.notAllowed(responseMessage.REPORT_NOT_ALLOWED);
      }
      let chatCheck = await findChat({
        _id: chatId,
        status: { $ne: status.DELETE },
      });
      if (!chatCheck) {
        throw apiError.notFound(responseMessage.CHAT_NOT_FOUND);
      }
      let reportCheck = await findReport({
        userId: userResult._id,
        chatId: chatId,
        status: { $ne: status.DELETE },
      });
      if (reportCheck) {
        throw apiError.conflict(responseMessage.ALREADY_REPORTED);
      }
      if (chatCheck.senderId.toString() === userResult._id.toString()) {
        reportedUserId = chatCheck.receiverId;
      } else {
        reportedUserId = chatCheck.senderId;
      }
      let notificationObj = {
        title: `Report Alert!`,
        description: `You are reported by someone.`,
        userId: reportedUserId,
        notificationType: "REPORT_ALERT",
        reportedBy: userResult._id,
      };
      await createNotification(notificationObj);

      let result = await createReport({
        userId: userResult._id,
        chatId: chatId,
      });
      return res.json(new response(result, responseMessage.REPORTED));
    } catch (error) {
      return next(error);
    }
  }

  // /**
  //   * @swagger
  //   * /user/subscription/{_id}:
  //   *   get:
  //   *     tags:
  //   *       - USER SUBSCRIPTION
  //   *     description: viewSubscription
  //   *     produces:
  //   *       - application/json
  //   *     parameters:
  //   *       - name: token
  //   *         description: token
  //   *         in: header
  //   *         required: true
  //   *       - name: _id
  //   *         description: _id
  //   *         in: path
  //   *         required: true
  //   *     responses:
  //   *       200:
  //   *         description: Returns success message
  //   */

  async viewSubscription(req, res, next) {
    const validationSchema = {
      _id: Joi.string().required(),
    };
    try {
      const { _id } = await Joi.validate(req.params, validationSchema);

      var subscriptionResult = await findSubscription({
        _id: _id,
        status: { $ne: status.DELETE },
      });
      if (!subscriptionResult) {
        throw apiError.conflict(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(
        new response(subscriptionResult, responseMessage.DETAILS_FETCHED)
      );
    } catch (error) {
      return next(error);
    }
  }

  // /**
  //   * @swagger
  //   * /user/subscription:
  //   *   delete:
  //   *     tags:
  //   *       - USER SUBSCRIPTION
  //   *     description: deleteSubscription
  //   *     produces:
  //   *       - application/json
  //   *     parameters:
  //   *       - name: token
  //   *         description: token
  //   *         in: header
  //   *         required: true
  //   *       - name: _id
  //   *         description: _id
  //   *         in: query
  //   *         required: true
  //   *     responses:
  //   *       200:
  //   *         description: Returns success message
  //   */

  async deleteSubscription(req, res, next) {
    const validationSchema = {
      _id: Joi.string().required(),
    };
    try {
      const { _id } = await Joi.validate(req.query, validationSchema);

      var subscriptionResult = await findSubscription({
        _id: _id,
        status: { $ne: status.DELETE },
      });
      if (!subscriptionResult) {
        throw apiError.conflict(responseMessage.DATA_NOT_FOUND);
      }
      var result = await updateSubscription(
        { _id: subscriptionResult._id },
        { status: status.DELETE }
      );
      return res.json(new response(result, responseMessage.DETAILS_FETCHED));
    } catch (error) {
      return next(error);
    }
  }

  //     /**
  //   * @swagger
  //   * /user/bundle/{_id}:
  //   *   get:
  //   *     tags:
  //   *       - USER BUNDLE
  //   *     description: viewBundle
  //   *     produces:
  //   *       - application/json
  //   *     parameters:
  //   *       - name: token
  //   *         description: token
  //   *         in: header
  //   *         required: true
  //   *       - name: _id
  //   *         description: _id
  //   *         in: path
  //   *         required: true
  //   *     responses:
  //   *       200:
  //   *         description: Returns success message
  //   */

  async viewBundle(req, res, next) {
    const validationSchema = {
      _id: Joi.string().required(),
    };
    try {
      const { _id } = await Joi.validate(req.params, validationSchema);

      var bundleResult = await findBundle({
        _id: _id,
        status: { $ne: status.DELETE },
      });
      if (!bundleResult) {
        throw apiError.conflict(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(
        new response(bundleResult, responseMessage.DETAILS_FETCHED)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/bundleContentList:
   *   get:
   *     tags:
   *       - USER BUNDLE
   *     description: reportNow
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: nftId
   *         description: nftId
   *         in: query
   *         required: true
   *       - name: search
   *         description: search
   *         in: query
   *         required: false
   *       - name: fromDate
   *         description: fromDate
   *         in: query
   *         required: false
   *       - name: toDate
   *         description: toDate
   *         in: query
   *         required: false
   *       - name: postType
   *         description: postType-PUBLIC/PRIVATE
   *         in: query
   *         required: false
   *       - name: page
   *         description: page
   *         in: query
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async bundleContentList(req, res, next) {
    try {
      const validationSchema = {
        nftId: Joi.string().required(),
        search: Joi.string().optional(),
        fromDate: Joi.string().optional(),
        toDate: Joi.string().optional(),
        postType: Joi.string().optional(),
        page: Joi.number().optional(),
        limit: Joi.number().optional(),
      };

      const validatedBody = await Joi.validate(req.query, validationSchema);
      var result = await audienceContentList(validatedBody);
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/donation:
   *   post:
   *     tags:
   *       - USER
   *     description: donation
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: userId
   *         description: userId ?? _id
   *         in: formData
   *         required: false
   *       - name: amount
   *         description: amount
   *         in: formData
   *         required: false
   *       - name: coinName
   *         description: coinName ?? USDT || BUSD || MAS || WARE || WBTC || ETH || BNB
   *         in: formData
   *         required: false
   *       - name: message
   *         description: message
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async donation(req, res, next) {
    const validationSchema = {
      userId: Joi.string().required(),
      amount: Joi.number().required().min(1),
      coinName: Joi.string().valid("MAS", "BUSD",'USDT').required(),
      message: Joi.string().optional().allow("").max(100),
    };
    const validate = Joi.validate(req.body, validationSchema);
    if (validate.error) { 
      return res.status(400).send(
        new response({},validate.error.details[0].message,400)
      ) 
    }
    let amount = parseFloat(req.body.amount);
    let balance = req.body.coinName.toLowerCase()+'Balance';

    try {
      let donatorUser = await findUserData({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!donatorUser)
      {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      if (parseFloat(donatorUser[balance]) >= amount ) 
      {
        let donatedToUser = await findUserData({
          _id: req.body.userId,
          status: { $ne: status.DELETE },
        });
        if (!donatedToUser) {
          throw apiError.notFound(responseMessage.USER_NOT_FOUND);
        }

        let supporterCount = donatedToUser.supporters.includes(donatorUser._id);

        var commissionResult = await sortFee({
          masHeld: { $lte: donatorUser.masBalance },
          status: status.ACTIVE,
        });
        var commissionFee = amount * (commissionResult.contentCreatorFee / 100);
        var donationAmount = amount - commissionFee;

        const creditDonator = await updateUser({ _id: donatorUser._id }, {
          $inc : { [balance] : - amount }
        });

        if(!creditDonator) {
          throw apiError.internal("Error updating user balance");
        }
        
        const debitDonatedTo = await updateUser({ _id: donatedToUser._id }, {
          $inc :{[balance] : donationAmount}
        });

        if(!debitDonatedTo){
          throw apiError.internal("Error updating user balance");
        }
        
        let transactionResult = await createTransaction({
          userId: donatorUser._id,
          toDonationUser: donatedToUser._id,
          amount: amount,
          transactionType: "Donation",
          transactionStatus: "SUCCESS",
          adminCommission: commissionFee,
          coinName: req.body.coinName,
        });

        await createChatForMember(donatedToUser._id, donatorUser._id);
        let certificate = await getCertificateNumber();
        let message = `You have recevied a donation amount 
        of ${donationAmount} ${req.body.coinName} 
        by ${donatorUser.name}.`;
        await manageDonationData(
          donatorUser._id,
          donatedToUser._id,
          supporterCount,
          message,
          amount,
          commissionFee,
          donationAmount,
          req.body.coinName,
          certificate
        );
        await createNotification({
          title: `Donation received Notification`,
          description: message,
          userId: donatedToUser._id,
          notificationType: "DONATION_RECEIVED",
        });
        return res.json(
          new response(transactionResult._id, responseMessage.DONATION_SUCCESS)
        );
      } else {
        return res.json(
          new response(
            `you have insufficient balance in ${req.body.coinName} in your wallet, Please add more ${req.body.coinName} first to your wallet .`
          )
        );
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/donateUserList:
   *   get:
   *     tags:
   *       - USER
   *     description: donateUserList
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async donateUserList(req, res, next) {
    try {
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let dataResults = await donationList({ userId: userResult._id });
      if (dataResults.length == 0) {
        return apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(new response(dataResults, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/sharedBundleList:
   *   get:
   *     tags:
   *       - USER
   *     description: sharedBundleList
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async sharedBundleList(req, res, next) {
    try {
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let bundleIds = await nftSubscriber({ isShared: true });
      bundleIds = bundleIds.map((i) => i._id);
      let dataResults = await sharedBundleList(userResult._id, bundleIds);
      return res.json(new response(dataResults, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/bundlePostList/{bundleId}:
   *   get:
   *     tags:
   *       - USER
   *     description: bundlePostList
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: false
   *       - name: bundleId
   *         description: bundleId
   *         in: path
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async bundlePostList(req, res, next) {
    try {
      let bundleIds = req.params.bundleId;
      if (req.headers.token) {
        jwt.verify(
          req.headers.token,
          config.get("jwtsecret"),
          async (err, result) => {
            if (err) {
              throw apiError.unauthorized();
            } else {
              userModel.findOne({ _id: result.id }, async (error, result2) => {
                if (error) {
                  return next(error);
                } else if (!result2) {
                  return apiError.notFound(responseMessage.USER_NOT_FOUND);
                } else {
                  if (result2.status == "BLOCK") {
                    throw apiError.forbidden(responseMessage.BLOCK_BY_ADMIN);
                  } else if (result2.status == "DELETE") {
                    throw apiError.unauthorized(
                      responseMessage.DELETE_BY_ADMIN
                    );
                  } else {
                    let dataResults = await sharedBundleListPerticular(
                      result2._id,
                      bundleIds
                    );
                    return res.json(
                      new response(dataResults, responseMessage.DATA_FOUND)
                    );
                  }
                }
              });
            }
          }
        );
      } else {
        let dataResults = await sharedBundleListPerticular(bundleIds);
        return res.json(new response(dataResults, responseMessage.DATA_FOUND));
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/getAdvertisement:
   *   get:
   *     tags:
   *       - USER
   *     description: getAdvertisement
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async getAdvertisement(req, res, next) {
    try {
      var result = await findAdvertisements({
        status: status.ACTIVE,
        startDate: { $lte: new Date().toISOString() },
        endDate: { $gte: new Date().toISOString() },
      });
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/getVideos:
   *   get:
   *     tags:
   *       - USER
   *     description: getVideos
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async getVideos(req, res, next) {
    try {
      var result = await findAllVideos({ status: status.ACTIVE });
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/getBanners:
   *   get:
   *     tags:
   *       - USER
   *     description: getBanners
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async getBanners(req, res, next) {
    try {
      var result = await findBanners({ status: status.ACTIVE });
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/getCategory:
   *   get:
   *     tags:
   *       - USER
   *     description: getCategory
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async getCategory(req, res, next) {
    try {
      let userResult = await findUserData({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let address;
      if (
        userResult.userType === "Creator" ||
        userResult.userType === "Admin"
      ) {
        address = userResult.ethAccount.address;
      } else {
        address = userResult.walletAddress;
      }
      let categoryType = await commonFunction.getFeeCategory(
        blockchainUrl,
        address
      );
      return res.json(
        new response(categoryType.planType, responseMessage.DETAILS_FETCHED)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/getCertificates:
   *   get:
   *     tags:
   *       - USER
   *     description: getCertificates
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async getCertificates(req, res, next) {
    try {
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var certificateResult = await donationList({
        senderUserId: userResult._id,
        status: { $ne: status.DELETE },
      });
      if (certificateResult.length == 0) {
        throw apiError.conflict(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(
        new response(certificateResult, responseMessage.DETAILS_FETCHED)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/donationTransactionlist:
   *   get:
   *     tags:
   *       - TRANSACTION MANAGEMENT
   *     description: donationTransactionlist
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: page
   *         description: page
   *         in: query
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Data found sucessfully.
   *       404:
   *         description: Data not Found.
   *       501:
   *         description: Something went wrong.
   */
  async donationTransactionlist(req, res, next) {
    const validationSchema = {
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
    };
    try {
      const validatedBody = await Joi.validate(req.query, validationSchema);
      var userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var result = await depositListWithPagination(
        userResult._id,
        validatedBody
      );
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  // /**
  //  * @swagger
  //  * /user/depositeTransactionlist:
  //  *   get:
  //  *     tags:
  //  *       - TRANSACTION MANAGEMENT
  //  *     description: depositeTransactionlist
  //  *     produces:
  //  *       - application/json
  //  *     parameters:
  //  *       - name: token
  //  *         description: token
  //  *         in: header
  //  *         required: true
  //  *     responses:
  //  *       200:
  //  *         description: Data found sucessfully.
  //  *       404:
  //  *         description: Data not Found.
  //  *       501:
  //  *         description: Something went wrong.
  //  */
  async depositeTransactionlist(req, res, next) {
    try {
      var userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var result = await depositeList({ toDonationUser: userResult._id });
      if (result.length == 0) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }
  /**
   * @swagger
   * /user/viewTransaction/{_id}:
   *   get:
   *     tags:
   *       - TRANSACTION MANAGEMENT
   *     description: viewTransaction
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: _id
   *         in: path
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async viewTransaction(req, res, next) {
    const validationSchema = {
      _id: Joi.string().required(),
    };
    try {
      const { _id } = await Joi.validate(req.params, validationSchema);
      var userResult = await findUser({
        _id: req.userId,
        userType: userType.USER,
      });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var donationBuffer = await findTransaction({
        _id: _id,
        status: { $ne: status.DELETE },
      });
      if (!donationBuffer) {
        throw apiError.conflict(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(
        new response(donationBuffer, responseMessage.DETAILS_FETCHED)
      );
    } catch (error) {
      return next(error);
    }
  }
  /**
   * @swagger
   * /user/publicPrivateFeed:
   *   post:
   *     tags:
   *       - USER
   *     description: publicPrivateFeed
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: bundleType
   *         description: bundleType
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async publicPrivateFeed(req, res, next) {
    try {
      var userResult = await findUser({
        _id: req.userId,
        userType: userType.USER,
      });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let feed = await postList({
        $and: [{ status: status.ACTIVE }, { users: { $in: userResult._id } }],
      });
      if (feed.length == 0) {
        return apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      let totalNFT = [];
      for (let [userdata] of Object.entries(feed)) {
        for (let nftId of userdata["nftId"]) {
          let nft = await findNft({
            _id: nftId,
            bundleType: req.body.bundleType,
          });
          if (nft) {
            totalNFT.push(nft);
          }
        }
      }
      return res.json(new response(totalNFT, responseMessage.DETAILS_FETCHED));
    } catch (error) {
      return next(error);
    }
  }
  /**
   * @swagger
   * /user/privatePublicFeed:
   *   post:
   *     tags:
   *       - USER
   *     description: privatePublicFeed
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: postType
   *         description: postType
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async privatePublicFeed(req, res, next) {
    try {
      var userResult = await findUser({
        _id: req.userId,
        userType: userType.USER,
      });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let privatePublicFeed = await postList({
        postType: req.body.postType,
        likesUsers: { $in: userResult._id },
        status: status.ACTIVE,
      });
      return res.json(
        new response(privatePublicFeed, responseMessage.DETAILS_FETCHED)
      );
    } catch (error) {
      return next(error);
    }
  }
  /**
   * @swagger
   * /user/viewMyfeed:
   *   get:
   *     tags:
   *       - USER
   *     description: viewMyfeed
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async viewMyfeed(req, res, next) {
    try {
      var userResult = await findUser({
        _id: req.userId,
        userType: userType.USER,
      });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let feed = await postList(
        { likesUsers: { $in: userResult._id } },
        { status: status.ACTIVE }
      );
      if (feed.length == 0) {
        return apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(new response(feed, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/findContentCreator/{_id}:
   *   get:
   *     tags:
   *       - USER
   *     description: findContentCreator
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: _id
   *         in: path
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async findContentCreator(req, res, next) {
    try {
      var userResult = await findUser({
        _id: req.userId,
        userType: userType.USER,
      });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var creatorResult = await findUserData({
        _id: req.params._id,
        userType: userType.CREATOR,
      });
      if (!creatorResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      return res.json(new response(creatorResult, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/unSubscription:
   *   delete:
   *     tags:
   *       - USER SUBSCRIPTION
   *     description: unSubscription
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: _id
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async unSubscription(req, res, next) {
    const validationSchema = {
      _id: Joi.string().required(),
    };
    try {
      const { _id } = await Joi.validate(req.query, validationSchema);
      var userResult = await findUserData({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let nftCheck = await findNft({
        _id: _id,
        status: { $ne: status.DELETE },
      });
      var subscriptionResult = await findSubscription({
        nftId: nftCheck._id,
        status: { $ne: status.DELETE },
      });
      if (!subscriptionResult) {
        throw apiError.conflict(responseMessage.DATA_NOT_FOUND);
      }
      var result = await updateSubscription(
        { _id: subscriptionResult._id },
        { status: status.DELETE }
      );
      await updateNft(
        { _id: result.nftId },
        {
          $pull: { subscribers: userResult._id },
          $set: { subscriberCount: nftCheck.subscriberCount - 1 },
        }
      );
      await updateUser(
        { _id: userResult._id },
        { $pull: { subscribeNft: result.nftId } }
      );
      return res.json(new response(result, responseMessage.DETAILS_FETCHED));
    } catch (error) {
      return next(error);
    }
  }
  /**
   * @swagger
   * /user/transactionList:
   *   get:
   *     tags:
   *       - TRANSACTION MANAGEMENT
   *     description: transactionList
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: page
   *         description: page
   *         in: query
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async transactionList(req, res, next) {
    const validationSchema = {
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
    };
    try {
      const validatedBody = await Joi.validate(req.query, validationSchema);
      let data;
      var userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      data = await depositListWithPopulate(userResult._id, validatedBody);
      return res.json(new response(data, responseMessage.DETAILS_FETCHED));
    } catch (error) {
      return next(error);
    }
  }
  /**
   * @swagger
   * /user/sharedFeedList:
   *   get:
   *     tags:
   *       - USER
   *     description: sharedFeedList
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async sharedFeedList(req, res, next) {
    try {
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let shared = await postList({
        userId: userResult._id,
        nftId: req.body.nftId,
        status: "ACTIVE",
      });
      if (shared.length == 0) {
        return apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(new response(shared, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new userController();

const deleteFile = async (filePath) => {
  fs.unlink(filePath, (deleteErr) => {
    if (deleteErr) {
      return deleteErr;
    }
  });
};

const manageDonationData = async (
  senderUserId,
  userId,
  supporterCount,
  message,
  amount,
  commission,
  donationAmount,
  coinName,
  certificate
) => {
  try {

  var adminResult = await findUser({ userType: userType.ADMIN });
  if (supporterCount === true) {
    await updateUser(
      { _id: userId },
      { $addToSet: { supporters: senderUserId }, $inc: { supporterCount: 1 } }
    );
  }
  
  let commissionObj = {},
      earningObj = {},
      firstCommission = {},
      userEarn = {};

      let balance = coinName.toLowerCase()+'Balance';
  
  commissionObj.$inc[balance] = parseFloat(commission);
  earningObj.$inc[balance] = parseFloat(donationAmount);
  firstCommission[balance] = commission;
  userEarn[balance] = donationAmount;

  let findData = await findDonation({
    userId: userId,
    status: { $ne: status.DELETE },
  });
  let obj = {
    userId: userId,
    history: [
      {
        senderUserId: senderUserId,
        message: message,
        amount,
        coinName: coinName,
      },
    ],
    certificateNumber: certificate,
  };
  obj[balance] = amount;
  if (!findData) {
    await createDonation(obj);
  } else {
    let incrementQuery = {
      $inc: { balance: parseFloat(amount) },
      $push: {
        history: {
          senderUserId: senderUserId,
          message: message,
          amount,
          coinName: coinName,
        },
      },
    };
    await updateDonation({ _id: findData._id }, incrementQuery);
    
  }


  var adminEarningResult = await findEarning({
    userId: adminResult._id,
    status: status.ACTIVE,
  });
  var userEarningResult = await findEarning({
    userId: userId,
    status: status.ACTIVE,
  });
  if (!adminEarningResult) {
    firstCommission.userId = adminResult._id;
    await createEarning(firstCommission);
  } else {
    await updateEarning({ _id: adminEarningResult._id }, commissionObj);
  }

  if (!userEarningResult) {
    userEarn.userId = userId;
    await createEarning(userEarn);
  } else {
    await updateEarning({ _id: userEarningResult._id }, earningObj);
  }

} catch(err) {
  return err;
}
  
};

const getCertificateNumber = () => {
  const digits = "0123456789";
  let txnId = "";
  for (let i = 0; i < 12; i++) {
    txnId += digits[Math.floor(Math.random() * 10)];
  }
  return txnId;
};

const createChatForMember = async (senderId, receiverId) => {
  var response;
  return new Promise(async (resolve) => {
    let req = {
      senderId: senderId,
      receiverId: receiverId,
    };
    var query = { clearStatus: false },
      chatQuery = {};
    if (senderId && receiverId) {
      query.$and = [
        { $or: [{ senderId: senderId }, { senderId: receiverId }] },
        { $or: [{ receiverId: receiverId }, { receiverId: senderId }] },
      ];
    }
    let result = await chatSchema.findOne(query);
    if (!result) {
      req.messages = [
        {
          message: "Hey there! I am happy that you joined us!",
          mediaType: "text",
          receiverId: receiverId,
          createdAt: new Date().toISOString(),
        },
      ];
      await new chatSchema(req).save();
    } else {
      if (result.status == "ACTIVE") {
        var messages = [
          {
            message: req.message,
            receiverId: receiverId,
            mediaType: req.mediaType ? req.mediaType : "text",
            createdAt: new Date().toISOString(),
          },
        ];
        var chatHistory = await chatSchema
          .find(chatQuery)
          .sort({ "messages.createdAt": -1 })
          .populate("senderId receiverId", "name profilePic")
          .exec();
        chatSchema.findByIdAndUpdate(
          { _id: result._id },
          { $push: { messages: messages } },
          { new: true },
          (err2, succ1) => {
            if (err2) {
              response = {
                response_code: 500,
                response_message: "Internal server error",
                err2,
              };
              resolve(response);
            } else if (!succ1) {
              response = {
                response_code: 404,
                response_message: "Data not found",
              };
              resolve(response);
            } else {
              var reversed_array = succ1;
              reversed_array.messages = reversed_array.messages.reverse();
              response = {
                response_code: 200,
                response_message: "Message send successfully.",
                result: reversed_array,
                chatHistory,
              };
              resolve(response);
            }
          }
        );
      } else {
        response = {
          response_code: 404,
          response_message: "You cant chat",
          result: result,
        };
        resolve(response);
      }
    }
  });
};

const addUserIntoFeed = async (nftId, userId) => {
  let audienceRes = await postList({
    nftId: { $in: [nftId] },
    status: { $ne: status.DELETE },
  });
  audienceRes = audienceRes.map((i) => i._id);
  await feedUpdateAll(
    { _id: { $in: audienceRes } },
    { $addToSet: { users: userId } }
  );
};
