const { MASTER } = require('../config')
const { randomInt } = require('node:crypto')
const insertLog = require('./log')

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

/**
 * 获取随机数
 * @param {Number} limit 随机数最大值
 * @returns {Number}
 */
function getPureRandomNumber(limit) {
  return randomInt(limit)
}

/**
 * 发送消息
 * @param {String} msg
 * @return {Void}
 */
async function replyMessage(msg) {
  await delay(300);
  try {
    
    await global['Message'].say(msg);

    const content = `{${global['Message'].to().name()}} ${msg}`
    insertLog({ action: 'SEND', content })
  } catch (error) {
    insertLog({
      type: 'err',
      action: 'RENAME',
      content: error
    })
  }
}

module.exports = {
  delay,
  hasPermission,
  isCommand,
  getRandomReplyMsg,
  replyMessage,
  getPureRandomNumber
}