const Express = require("express");
const controller = require("./controller");
const auth = require("../../../../helper/auth");

module.exports = Express.Router()

  .use(auth.verifyToken)
  .get("/getBalance/:address/:coin", controller.getBalance)
  .post("/withdraw", controller.withdraw)
  .post("/transfer", controller.transfer)
  .post("/bnbTransfer", controller.bnbTransfer)
