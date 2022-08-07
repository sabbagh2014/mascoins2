const status = require("../../../../enums/status");
const config = require("config");
const axios = require("axios");
const blockchainUrl = config.get("blockchainMainnetBaseUrl");

const { userServices } = require("../../services/user");
const { notificationServices } = require("../../services/notification");
const { transactionServices } = require("../../services/transaction");
const { donationBufferServices } = require("../../services/donationBuffer");
const { donationServices } = require("../../services/donation");

const { updateUser } = userServices;
const { createNotification } = notificationServices;
const { createTransaction } = transactionServices;
const { findDonationBuffer, updateDonationBuffer } = donationBufferServices;
const { createDonation, findDonation, updateDonation } = donationServices;

const cronJob = require("cron").CronJob;
var transactionHash, notificationObj, transObj, transactionObj;
let jobMain = new cronJob("*/10 * * * * *", async function () {
  var getBufferResult = await findDonationBuffer({
    status: { $ne: status.DELETE },
    transactionStatus: "PENDING",
  });
  if (!getBufferResult) {
    console.log("No records found for subscribe buffer dbs.");
  } else {
    jobMain.stop();
    transactionObj = {
      userId: getBufferResult.userId,
      amount: getBufferResult.amount,
      coinName: getBufferResult.coin,
    };
    let message = `You have recevied a donation amount of ${getBufferResult.amount} ${getBufferResult.coin} by ${getBufferResult.name}.`;
    notificationObj = {
      title: `Donation Alert!`,
      description: message,
      userId: getBufferResult.receiverUserId,
      notificationType: "DONATION_RECEIVED",
    };
    if (getBufferResult.coin === "BNB") {
      jobMain.stop();
      try {
        transactionHash = await axios.post(`${blockchainUrl}/distributeEther`, {
          amountToSend: getBufferResult.amount.toString(),
          user: [getBufferResult.toAddress],
          amount: [getBufferResult.amount.toString()],
          privateKey: getBufferResult.privateKey,
          coin: getBufferResult.coin,
        });
        sendNotification(getBufferResult.userId, transactionHash.data.Hash);
        transactionObj.transactionHash = transactionHash.data.Hash;
        await createTransaction(transactionObj);
        await createNotification(notificationObj);

        await manageDonationData(
          getBufferResult.userId,
          getBufferResult.receiverUserId,
          getBufferResult.supporterCount,
          message,
          getBufferResult.amount,
          getBufferResult.coin,
          getBufferResult.certificate
        );

        await updateDonationBuffer(
          { _id: getBufferResult._id },
          {
            transactionStatus: "SUCCESS",
            transactionHash: transactionHash.data.Hash,
          }
        );
        jobMain.stop();
        jobMain.start();
      } catch (error) {
        jobMain.stop();
        jobMain.start();
      }
    } else {
      jobMain.stop();
      transObj = {
        user: [getBufferResult.toAddress],
        amount: [getBufferResult.amount.toString()],
        senderAddress: getBufferResult.fromAddress,
        privateKey: getBufferResult.privateKey,
        coin: getBufferResult.coin,
      };
      try {
        transactionHash = await axios.post(
          `${blockchainUrl}/distributeTokens`,
          transObj
        );
        sendNotification(getBufferResult.userId, transactionHash.data.Hash);
        transactionObj.transactionHash = transactionHash.data.Hash;
        await createTransaction(transactionObj);
        await createNotification(notificationObj);
        await manageDonationData(
          getBufferResult.userId,
          getBufferResult.receiverUserId,
          getBufferResult.supporterCount,
          message,
          getBufferResult.amount,
          getBufferResult.coin,
          getBufferResult.certificate
        );
        await updateDonationBuffer(
          { _id: getBufferResult._id },
          {
            transactionStatus: "SUCCESS",
            transactionHash: transactionHash.data.Hash,
          }
        );
        jobMain.stop();
        jobMain.start();
      } catch (error) {
        jobMain.stop();
        jobMain.start();
      }
    }
  }
});
jobMain.start();

const sendNotification = async (userId, txHash) => {
  await createNotification({
    title: `Transaction Successfull Alert!`,
    description: `Your payment has been confirmed successfully, your transaction id is ${txHash}.`,
    userId: userId,
    notificationType: "PAYMENT_SUCCESS",
  });
};

const manageDonationData = async (
  senderUserId,
  userId,
  supporterCount,
  message,
  amount,
  coinName,
  certificate
) => {
  if (supporterCount === true) {
    await updateUser(
      { _id: userId },
      { $addToSet: { supporters: senderUserId }, $inc: { supporterCount: 1 } }
    );
  }
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
  let updateQuery = { $addToSet: { supporters: senderUserId } };
  if (coinName === "MAS") {
    obj.masBalance = amount;
    updateQuery.$inc = { masBalance: Number(amount) };
  }
  if (coinName === "BNB") {
    obj.bnbBalance = amount;
    updateQuery.$inc = { bnbBalance: Number(amount) };
  }
  if (coinName === "USDT") {
    obj.usdtBalance = amount;
    updateQuery.$inc = { usdtBalance: Number(amount) };
  }
  if (coinName === "BUSD") {
    obj.busdBalance = amount;
    updateQuery.$inc = { busdBalance: Number(amount) };
  }
  await updateUser({ _id: userId }, updateQuery);
  if (!findData) {
    await createDonation(obj);
  } else {
    let incrementQuery = {
      $push: {
        history: {
          senderUserId: senderUserId,
          message: message,
          amount,
          coinName: coinName,
        },
      },
    };
    if (coinName === "MAS") {
      incrementQuery.$inc = { masBalance: Number(amount) };
    }
    if (coinName === "BNB") {
      incrementQuery.$inc = { bnbBalance: Number(amount) };
    }
    if (coinName === "USDT") {
      incrementQuery.$inc = { usdtBalance: Number(amount) };
    }
    if (coinName === "BUSD") {
      incrementQuery.$inc = { busdBalance: Number(amount) };
    }
    await updateDonation({ _id: findData._id }, incrementQuery);
  }
};
