const { FileBox } = require('file-box')
const { AUTO_MSG, HELLO_MSG, BYE_MSG } = require('../../config/index')
const DICT = require('../../dict')
const insertLog = require('../../utils/log')
const {
  hasPermission,
  delay,
  isCommand,
  getRandomReplyMsg
} = require('../../utils/utils')

let CACHE_NUMBER = 0,CACHE_STATUS = false,CACHE_NAME = ''

/**
 * 处理文字消息的逻辑
 * @param {String} msg text-message-content
 * @param  {...any} args 
 * @returns {Function}
 */
function handleMessage(msg, ...args) {
  if (isCommand(msg)) {
    return handleCommandMessage(msg, ...args)
  } else {
    return handleTextMessage(msg, ...args)
  }
}

/**
 * 普通文字消息
 * @param {String} msg 
 * @returns {Promise}
 */
function handleTextMessage(msg) {
  switch (msg) {
    case '你好':
      return replyMessage(HELLO_MSG)
    case '晚安':
      return replyMessage(BYE_MSG)
    default:
      return isGaming(msg)
  }
}

/**
 * 指令消息
 * @param {String} msg 
 * @param  {...any} args 
 * @returns 
 */
async function handleCommandMessage(msg, ...args) {
  const command = msg.substring(5, msg.length).split(' ')
  const name = command[0] // 指令名
  const value = command[1] // 指令值

  // 检查是否具有指令权限
  if (!hasPermission(args[0])) {
    const randomMsg =  getRandomReplyMsg(DICT.REFUSED_TEXT)
    await replyMessage(randomMsg);
    return 
  }

  // 指令handle
  switch (name) {
    case '更换名字':
      return renameBot(value)
    case '猜数字':
      return guessNumber(value)
    case '结束':
      return gameStop()
    default:
      return replyMessage(DICT.ERROR_MSG.COMMAND_ERROR)
  }
}

// 检查是否游戏中
function isGaming(msg) {
  if (CACHE_STATUS) {
    replyMessage(guess(msg))
  } else {
    replyMessage(AUTO_MSG)
  }
}

// 初始化猜数字
function guessNumber(limit) {
  const num = Math.ceil(Math.random() * limit)
  CACHE_NUMBER = num
  CACHE_STATUS = true

  replyMessage('game start!')
}

// 猜
function guess(num) {
  const number = Number(num)
  if (Number.isNaN(number)) return getRandomReplyMsg(DICT.UNKNOWN_PARAMS_TEXT)
  if (number === CACHE_NUMBER) return getRandomReplyMsg(DICT.GAME_SUCCESS_TEXT)
  if (number < CACHE_NUMBER) return replyMessage('小了！')
  if (number > CACHE_NUMBER) return replyMessage('大了！')
}

/**
 * 发送消息
 * @param {String} msg
 * @return {Void}
 */
async function replyMessage(msg) {
  await delay(200);
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

/**
 * 重命名
 * @param {String} name 
 * @return {Void}
 */
async function renameBot(name) {
  await delay(200);
  try {
    await global['ContactSelf'].name(name);
  } catch (error) {
    insertLog({
      type: 'err',
      action: 'RENAME',
      content: error
    })
  }
}

// 停止指令游戏
function gameStop() {
  CACHE_NUMBER = 0
  CACHE_STATUS = false
  replyMessage('game over!')
}

module.exports = {
  handleMessage,
  replyMessage,
  renameBot
}