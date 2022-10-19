const { CONFIRM_MSG }  = require("../config");
const insertLog = require('../utils/log');

/**
 * 好友请求
 */
async function onFriendship(friendship, bot) {
  const content = `<${friendship.contact().name()}> ${friendship.hello()}`
  insertLog({ action: 'Friendship', content })
  if (friendship.type() === bot.Friendship.Type.Receive && friendship.hello().includes(CONFIRM_MSG)) {
    await friendship.accept();
  }
}

module.exports = onFriendship