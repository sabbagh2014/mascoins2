const status = require("../../../../enums/status");
const userType = require("../../../../enums/userType");

const { transactionServices } = require("../../services/transaction");
const { transactionList, updateTransaction } = transactionServices;

const { notificationServices } = require("../../services/notification");
const { createNotification } = notificationServices;
const { userServices } = require("../../services/user");

const bnb = require("../../../../helper/bnb");
const Web3 = require("web3");


const cronJob = require("cron").CronJob;


let jobMain = new cronJob("* * * * * ", async function () {
  var withdrawal;
  var transaction;
  var getApprovedWithdrawals = await transactionList({
    status: { $ne: status.DELETE },
    transactionType : "Withdraw",
    transactionStatus: "PROCESSING",
  });
  
  if (getApprovedWithdrawals.length > 0) {
    jobMain.stop();
    try {
      withdrawal = getApprovedWithdrawals[0];
      let admin = await userServices.findUser({ userType: userType.ADMIN });

      if (withdrawal.coinName === "BNB") {
        transaction = await bnb.withdraw(
          admin.ethAccount.address,
          admin.ethAccount.privateKey,
          withdrawal.recipientAddress,
          withdrawal.amount
        );
      } else {
        var token = bnb[withdrawal.coinName.toLowerCase()];
        transaction = await token.withdraw(
          admin.ethAccount.address,
          admin.ethAccount.privateKey,
          withdrawal.recipientAddress,
          Web3.utils.toWei(withdrawal.amount.toString()),
        );
      }  
    } catch (error) {
       console.log(error.message);
    }

    if(transaction.Success){
      await updateTransaction(
        { _id: withdrawal._id },
        {
          transactionStatus: "SUCCESS",
          transactionHash: transaction.Hash,
        }
      );
      sendNotification(withdrawal.userId, transaction.Hash);
    } else {
      await updateTransaction(
        { _id: withdrawal._id },
        {
          transactionStatus: "FAILED",
        }
      );
    }
    jobMain.start();
  }
});

module.exports = jobMain;


const sendNotification = async (userId, txHash) => {
  await createNotification({
    title: `Withdraw Transaction Successfull !`,
    description: `Your payment has been confirmed successfully, your transaction hash is ${txHash}`,
    userId: userId,
    notificationType: "PAYMENT_SUCCESS",
  });
};