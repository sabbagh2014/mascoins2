const Express = require("express");
const controller = require("./controller");
const auth = require("../../../../helper/auth");

module.exports = Express.Router()

  .get("/deleteChatHistory", controller.deleteChatHistory)
  .post("/oneToOneChatApi", controller.oneToOneChatApi)

  .use(auth.verifyToken)
  .get("/readChat/:chatId", controller.readChat)
  .post("/chatHistory", controller.chatHistory);
