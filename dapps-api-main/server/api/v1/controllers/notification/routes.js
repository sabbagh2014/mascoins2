const Express = require("express");
const controller = require("./controller");
const auth = require("../../../../helper/auth");

module.exports = Express.Router()

  .use(auth.verifyToken)
  .post("/notification", controller.createNotification)
  .get("/notification/:_id", controller.viewNotification)
  .delete("/notification", controller.deleteNotification)
  .get("/listNotification", controller.listNotification)
  .get("/readNotification", controller.readNotification);
