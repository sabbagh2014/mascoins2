const Joi = require("joi");
const config = require("config");
const apiError = require("../../../../helper/apiError");
const response = require("../../../../../assets/response");
const responseMessage = require("../../../../../assets/responseMessage");
const { userServices } = require("../../services/user");
const { transactionServices } = require("../../services/transaction");
const { feeServices } = require("../../services/fee");
const { earningServices } = require("../../services/earning");
const { createTransaction } = transactionServices;

const { findUser, findUserData, updateUser } = userServices;
const { sortFee } = feeServices;
const { findEarning, createEarning, updateEarning } = earningServices;
const userType = require("../../../../enums/userType");
const status = require("../../../../enums/status");

class blockchainController {
  /**
   * @swagger
   * /blockchain/getBalance/{address}/{coin}:
   *   get:
   *     tags:
   *       - BLOCKCHAIN
   *     description: getBalance
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: address
   *         description: address
   *         in: path
   *         required: false
   *       - name: coin
   *         description: coin
   *         in: path
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async getBalance(req, res, next) {
    const validationSchema = {
      address: Joi.string().required(),
      coin: Joi.string().required(),
    };
    try {
      const { address, coin } = await Joi.validate(
        req.params,
        validationSchema
      );
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let result = await axios.get(
        `${blockchainUrl}/getBalance/${address}/${coin}`
      );
      return res.json(new response(result.data, responseMessage.USER_DETAILS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /blockchain/transfer:
   *   post:
   *     tags:
   *       - BLOCKCHAIN
   *     description: transfer
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: senderAddress
   *         description: senderAddress
   *         in: formData
   *         required: false
   *       - name: amountToSend
   *         description: amountToSend
   *         in: formData
   *         required: false
   *       - name: coin
   *         description: coin ?? USDT || BUSD || MAS
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async transfer(req, res, next) {
    const validationSchema = {
      senderAddress: Joi.string().required(),
      amountToSend: Joi.string().required(),
      coin: Joi.string().required(),
    };
    try {
      const { senderAddress, amountToSend, coin } = await Joi.validate(
        req.body,
        validationSchema
      );
      let userResult = await findUserData({ _id: req.userId });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let admin = await findUser({ userType: userType.ADMIN });

      let transferRes = await axios.post(`${blockchainUrl}/withdraw`, {
        fromAddress: senderAddress,
        privateKey: userResult.ethAccount.privateKey,
        toAddress: admin.ethAccount.address,
        amount: amountToSend,
        coin: coin,
      });

      let updateQuery = {};
      if (coin === "MAS") {
        updateQuery.$inc = { masBalance: Number(amountToSend) };
      }
      if (coin === "BNB") {
        updateQuery.$inc = { bnbBalance: Number(amountToSend) };
      }
      if (coin === "USDT") {
        updateQuery.$inc = { usdtBalance: Number(amountToSend) };
      }
      if (coin === "BUSD") {
        updateQuery.$inc = { busdBalance: Number(amountToSend) };
      }
      let adminUp = await updateUser({ _id: admin._id }, updateQuery);
      if (adminUp) {
        await updateUser({ _id: userResult._id }, updateQuery);
      }
      await createTransaction({
        userId: userResult._id,
        amount: amountToSend,
        transactionHash: transferRes.data.Hash,
        coinName: coin,
        transactionType: "Deposite",
      });
      return res.json(
        new response(transferRes.data, responseMessage.USER_DETAILS)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /blockchain/withdraw:
   *   post:
   *     tags:
   *       - BLOCKCHAIN
   *     description: withdraw
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: senderAddress
   *         description: senderAddress
   *         in: formData
   *         required: false
   *       - name: amountToSend
   *         description: amountToSend
   *         in: formData
   *         required: false
   *       - name: coin
   *         description: coin
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */

   async withdraw(req, res, next) {
    const validationSchema = {
      recipientAddress: Joi.string().required(),
      withdrawAmount: Joi.number().required(),
      coin: Joi.string().required(),
    };
    try {
      let { recipientAddress, withdrawAmount, coin } = await Joi.validate(
        req.body,
        validationSchema
      );

      //
      let userResult = await findUserData({ _id: req.userId });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      
      
      let admin = await findUser({ userType: userType.ADMIN });
      var commissionObj = {};
      var firstCommission = {};

      var commissionResult = await sortFee({
        masHeld: { $lte: userResult.masBalance },
        status: status.ACTIVE,
      });
      var commissionFee = withdrawAmount * (commissionResult.contentCreatorFee / 100);
      var amount = withdrawAmount + commissionFee;

      var balance = coin.toLowerCase() + "Balance";

      if (amount > userResult[balance]) {
        throw apiError.badRequest(responseMessage.INSUFFICIENT_BALANCE(coin));
      }
          
      await updateUser({ _id: userResult._id }, { $inc: { [balance]: -amount } });

      let internalUserResult = await findUserData({ "ethAccount.address": recipientAddress });
      
      if(internalUserResult){
        await updateUser({ _id: internalUserResult._id }, { $inc: { [balance]: withdrawAmount } });
        await createTransaction({
          userId: internalUserResult._id,
          amount: withdrawAmount,
          recipientAddress: recipientAddress,
          coinName: coin,
          transactionType: "Deposit",
          transactionStatus: "SUCCESS" 
        });
      }

      await createTransaction({
        userId: userResult._id,
        amount: withdrawAmount,
        recipientAddress: recipientAddress,
        coinName: coin,
        adminCommission: commissionFee,
        transactionType: "Withdraw",
        transactionStatus: internalUserResult ? "SUCCESS" : "PROCESSING"
      });
      
      commissionObj = { $inc: { [balance]: commissionFee } };
      firstCommission[balance] = commissionFee;
      
      var adminEarningResult = await findEarning({
        userId: admin._id,
        status: status.ACTIVE,
      });

      if (!adminEarningResult) {
        firstCommission.userId = admin._id;
        await createEarning(firstCommission);
      } else {
        await updateEarning({ _id: adminEarningResult._id }, commissionObj);
      }

      return res.json(
        new response(responseMessage.TRANSACTION_SUCCESS)
      );
    } catch (error) {
      return next(error);
    }
  }  /**
   * @swagger
   * /blockchain/bnbTransfer:
   *   post:
   *     tags:
   *       - BLOCKCHAIN
   *     description: bnbTransfer
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: senderAddress
   *         description: senderAddress
   *         in: formData
   *         required: false
   *       - name: privateKey
   *         description: privateKey
   *         in: formData
   *         required: false
   *       - name: amountToSend
   *         description: amountToSend
   *         in: formData
   *         required: false
   *       - name: coin
   *         description: coin
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async bnbTransfer(req, res, next) {
    const validationSchema = {
      senderAddress: Joi.string().required(),
      amountToSend: Joi.string().required(),
      coin: Joi.string().required(),
    };
    try {
      const { senderAddress, amountToSend, coin } = await Joi.validate(
        req.body,
        validationSchema
      );
      let userResult = await findUserData({ _id: req.userId });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let admin = await findUser({ userType: userType.ADMIN });

      let transferRes = await axios.post(`${blockchainUrl}/bnbwithdraw`, {
        senderAddress: senderAddress,
        privateKey: userResult.ethAccount.privateKey,
        recieverAddress: admin.ethAccount.address,
        amountToSend: amountToSend,
      });

      let updateQuery = {};

      if (coin === "BNB") {
        updateQuery.$inc = { bnbBalance: Number(amountToSend) };
      }
      let adminUp = await updateUser({ _id: admin._id }, updateQuery);
      if (adminUp) {
        await updateUser({ _id: userResult._id }, updateQuery);
      }
      await createTransaction({
        userId: userResult._id,
        amount: amountToSend,
        transactionHash: transferRes.data.Hash,
        coinName: coin,
        transactionType: "Deposite",
      });
      return res.json(
        new response(transferRes.data, responseMessage.USER_DETAILS)
      );
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new blockchainController();
