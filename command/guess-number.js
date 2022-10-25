const { getRandomReplyMsg, replyMessage } = require('../utils/utils')
const DICT = require('../dict')

let CACHE_NUMBER = 0

// 初始化猜数字
function init(msg) {
  const limit = msg || 100
  const num = Math.ceil(Math.random() * limit)
  CACHE_NUMBER = num
  replyMessage('game start!')
}

/**
 * 比较number
 * @param {String} num 
 * @returns {String} 比较结果
 */
function guess(num) {
  const number = Number(num)
  if (Number.isNaN(number)) {
    replyMessage(getRandomReplyMsg(DICT.UNKNOWN_PARAMS_TEXT))
    return 
  }

  if (number < CACHE_NUMBER) {
    replyMessage('小了！')
  } else if (number > CACHE_NUMBER) {
    replyMessage('大了！')
  } else {
    replyMessage(getRandomReplyMsg(DICT.GAME_SUCCESS_TEXT))
    return true
  }
}

module.exports = {
  init,
  guess
}