const Joi = require("joi");
const apiError = require("../../../../helper/apiError");
const response = require("../../../../../assets/response");
const responseMessage = require("../../../../../assets/responseMessage");
const { userServices } = require("../../services/user");
const { notificationServices } = require("../../services/notification");

const { findUser } = userServices;
const {
  createNotification,
  findNotification,
  updateNotification,
  multiUpdateNotification,
  notificationList,
  notificationListWithSort,
} = notificationServices;

const status = require("../../../../enums/status");
const auth = require("../../../../helper/auth");

class notificationController {
  async getNotificationList(token) {
    try {
      var unReadCount = 0;
      let userId = await auth.verifyTokenBySocket(token);
      const responseData = await notificationListWithSort({
        userId: userId,
        status: { $ne: status.DELETE },
      });
      if (responseData.length == 0) {
        return apiError.notFound(responseMessage.DATA_NOT_FOUND);
      } else {
        for (let i = 0; i < responseData.length; i++) {
          if (responseData[i].isRead === false) {
            unReadCount += 1;
          }
        }
        let obj = {
          data: responseData,
          unReadCount: unReadCount,
        };
        return {
          responseCode: 200,
          responseMessage: "Data fetched successfully!",
          responseResult: obj,
        };
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * @swagger
   * /notification/notification:
   *   post:
   *     tags:
   *       - NOTIFICATION MANAGEMENT
   *     description: createNotification
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: createNotification
   *         description: createNotification
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/createNotification'
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async createNotification(req, res, next) {
    const validationSchema = {
      title: Joi.string().required(),
      description: Joi.string().optional(),
      notificationType: Joi.string().optional(),
      image: Joi.string().optional(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      validatedBody.userId = userResult._id;
      var notificationResult = await createNotification(validatedBody);
      return res.json(
        new response(notificationResult, responseMessage.DETAILS_FETCHED)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /notification/notification/{_id}:
   *   get:
   *     tags:
   *       - NOTIFICATION MANAGEMENT
   *     description: viewNotification
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

  async viewNotification(req, res, next) {
    const validationSchema = {
      _id: Joi.string().required(),
    };
    try {
      const { _id } = await Joi.validate(req.params, validationSchema);
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var notificationResult = await findNotification({
        _id: _id,
        status: { $ne: status.DELETE },
      });
      if (!notificationResult) {
        return apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(
        new response(notificationResult, responseMessage.DETAILS_FETCHED)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /notification/notification:
   *   delete:
   *     tags:
   *       - NOTIFICATION MANAGEMENT
   *     description: deleteNotification
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

  async deleteNotification(req, res, next) {
    const validationSchema = {
      _id: Joi.string().required(),
    };
    try {
      const { _id } = await Joi.validate(req.query, validationSchema);
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var notificationResult = await findNotification({
        _id: _id,
        status: { $ne: status.DELETE },
      });
      if (!notificationResult) {
        throw apiError.conflict(responseMessage.DATA_NOT_FOUND);
      }
      var result = await updateNotification(
        { _id: notificationResult._id },
        { status: status.DELETE }
      );
      return res.json(new response(result, responseMessage.DETAILS_FETCHED));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /notification/listNotification:
   *   get:
   *     tags:
   *       - NOTIFICATION MANAGEMENT
   *     description: listNotification
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

  async listNotification(req, res, next) {
    try {
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let dataResults = await notificationList({
        status: { $ne: status.DELETE },
      });
      return res.json(new response(dataResults, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /notification/readNotification:
   *   get:
   *     tags:
   *       - NOTIFICATION MANAGEMENT
   *     description: readNotification
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
  async readNotification(req, res, next) {
    try {
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        return apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var result = await multiUpdateNotification(
        { userId: userResult._id },
        { isRead: true }
      );
      return res.json(new response(result, responseMessage.DETAILS_FETCHED));
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new notificationController();
