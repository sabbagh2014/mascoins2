const config = require("config");

//
let contractABI = config.get("contractABI");
contractABI = contractABI.map((method) => ({ ...method }));

module.exports = class tokenERC {
  constructor(address, web3) {
    this.web3 = web3;
    this.contract = new web3.eth.Contract(contractABI, address);
    this.address = address;
  }

  async weibBalance(address) {
    return await this.contract.methods.balanceOf(address).call();
  }

  async balance(address) {
    // Get balance with wei unit
    const weibBalance = await this.weibBalance(address);

    //
    return this.web3.utils.fromWei(weibBalance);
  }

  async withdraw(address, privateKey, toAddress, amount) {
    try {
      const gasPrice = await this.web3.eth.getGasPrice();

      console.log(gasPrice);
      const Data = await this.contract.methods
        .transfer(toAddress, amount.toString())
        .encodeABI();

      const rawTransaction = {
        to: this.address,
        from: address,
        value: 0,
        gasPrice: gasPrice,
        gasLimit: this.web3.utils.toHex("2000000"),
        data: Data,
      };

      const signPromise = await this.web3.eth.accounts.signTransaction(
        rawTransaction,
        privateKey.toString()
      );

      let result = await this.web3.eth.sendSignedTransaction(
        signPromise.rawTransaction
      );

      if (result) {
        return {
          Success: true,
          Hash: signPromise.transactionHash,
        };
      }
    } catch (error) {
      console.log(error);
      return { Success: false };
    }
  }

  async fullWithdraw(address, privateKey, toAddress) {
    const amount = await this.weibBalance(address);

    // Withdraw to admin address
    return await this.withdraw(address, privateKey, toAddress, amount);
  }
}
