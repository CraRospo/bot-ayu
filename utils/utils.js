const { MASTER } = require('../config')

/**
 * 延迟
 * @param {Number} ms delay-seconds
 */
function delay (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 检查是否拥有白名单权限
 * @param {String} name contact-name
 * @returns 
 */
function hasPermission(name) {
  return MASTER.includes(name)
}

/**
 * 匹配是否是指令
 * @param {String} message message
 * @returns {Boolean}
 */
function isCommand(message) {
  return message.match(/^&amp;.+/)
}

/**
 * 随机回复指定字典
 * @param {Array} dictCollection 
 * @returns {String}
 */
function getRandomReplyMsg(dictCollection) {
  return dictCollection[Math.floor(Math.random() * dictCollection.length)]
}

module.exports = {
  delay,
  hasPermission,
  isCommand,
  getRandomReplyMsg
}