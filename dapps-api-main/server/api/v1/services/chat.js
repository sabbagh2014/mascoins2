const chatModel = require("../../../models/chatting");
const userModel = require("../../../models/user");

const chatServices = {
  createChat: async (insertObj) => {
    return await chatModel.create(insertObj);
  },

  findChat: async (query) => {
    return await chatModel.findOne(query);
  },

  updateChat: async (query, updateObj) => {
    return await chatModel.findOneAndUpdate(query, updateObj, { new: true });
  },

  chatList: async (query) => {
    let activeIds = await getActiveUser();
    query.userId = { $in: activeIds };
    return await chatModel.find(query);
  },
};

module.exports = { chatServices };

const getActiveUser = async () => {
  let userId = await userModel.find({ blockStatus: false }).select("_id");
  userId = userId.map((i) => i._id);
  return userId;
};
