const config = require("config");
const tokenERC = require("./token");
const Web3 = require("web3");

let web3 = new Web3(new Web3.providers.HttpProvider(config.get("rpc")));

const masContract = config.get("masContractAddress");
const busdContract = config.get("busdContractAddress");
const usdtContract = config.get("usdtContractAddress");

const mas = new tokenERC(masContract, web3);

const busd = new tokenERC(busdContract, web3);

const usdt = new tokenERC(usdtContract, web3);

async function helper() {
  let gasPrice = await web3.eth.getGasPrice();

  let gasLimit = 21000;
  let fee = gasLimit * gasPrice;

  let txFee = Number(web3.utils.fromWei(fee.toString(), "ether"));

  return { fee: txFee, gasPrice: gasPrice };
}

async function balance(address) {
  return await web3.eth.getBalance(address);
}

async function accountBalance(address) {
  const response = await balance(address);

  //
  let _balance = web3.utils.fromWei(response, "ether");

  //
  return Number(_balance);
}

async function canAddressSend(address, weiAmount) {
  const { fee } = await helper();

  // Get address balance with wei unit
  let balance = await accountBalance(address);

  // Check if result more than
  return balance - weiAmount - fee >= 0;
}

async function withdraw(fromAddress, fromPrivateKey, toAddress, amountToSend) {
  try {
    const gasPrice = await web3.eth.getGasPrice();

    const status = await canAddressSend(fromAddress, amountToSend);

    // Check is balance low
    if (status == false) {
      console.log({ status: status, message: "Low Balance" });
    }

    // Create transaction object
    let transaction = {
      to: toAddress,
      value: web3.utils.toHex(
        web3.utils.toWei(amountToSend.toString(), "ether")
      ),
      gas: 21000,
      gasPrice: gasPrice,
    };

    //
    const signedTx = await web3.eth.accounts.signTransaction(
      transaction,
      fromPrivateKey
    );

    //
    const signTransaction = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );

    // Return sucess
    return {
      Status: true,
      Hash: signTransaction.transactionHash,
      message: "Success",
    };
  } catch (error) {
    return {
      Status: false,
      message: "Something went wrong!",
    };
  }
}

async function fullWithdraw(fromAddress, fromPrivateKey, toAddress) {
  const { fee } = await helper();
  const amountToSend = (await accountBalance(fromAddress)) - fee - 0.000001;

  const result = await withdraw(
    fromAddress,
    fromPrivateKey,
    toAddress,
    amountToSend
  );

  // Add balance to result object
  result.Balance = amountToSend;

  //
  return result;
}
module.exports = {
  balance,
  accountBalance,
  withdraw,
  fullWithdraw,
  helper,
  mas,
  usdt,
  busd,
};
