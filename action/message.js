const { HELLO_MSG, BYE_MSG } = require('../config/index')
const DICT = require('../dict')
const insertLog = require('../utils/log')
const { init: initGuessNumber, guess } = require('../command/guess-number')
const { init: initTwentyOnePoint, dispatchCard } = require('../command/twenty-one-point')
const {
  hasPermission,
  isCommand,
  getRandomReplyMsg,
  replyMessage,
  delay
} = require('../utils/utils')
const { getAccount, getReward } = require('../api/message-command')

let CACHE_CURRENT_CONTACT = ''
    CACHE_STATUS = false,
    CACHE_NAME = ''

/**
 * 处理文字消息的逻辑
 * @param {String} msg text-message-content
 * @param  {...any} args 
 * @returns {Function}
 */
function handleMessage(msg, ...args) {
  if (CACHE_STATUS) return getCommandType(CACHE_NAME, msg)
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
    replyMessage(randomMsg);
    return 
  }

  CACHE_CURRENT_CONTACT = args[0]
  getCommandType(name, value)
  
}

/**
 * 执行指令
 * @param {String} name 
 * @param {String} value 指令值 | 当前指令下的msg
 * @returns {Function}
 */
function getCommandType(name, value) {
  // 指令handle
  switch (name) {
    case '更换名字':
      return renameBot(value)
    case '猜数字':
      return guessNumber(value)
    case '21点':
      return twentyOnePoint(value)
    case '账户':
      return getAccountInfo(CACHE_CURRENT_CONTACT)
    case '低保':
      return getRewardAction(CACHE_CURRENT_CONTACT)
    case '结束':
      return gameStop()
    default:
      return replyMessage(DICT.ERROR_MSG.COMMAND_ERROR)
  }
}

/**
 * 猜数字
 * @param {String} msg 
 */
function guessNumber(msg) {
  // 
  if (CACHE_STATUS) {
    const end = guess(msg)
    if (end) gameStop()
  } else {
    CACHE_STATUS = true
    CACHE_NAME = '猜数字'
    initGuessNumber(msg)
  }
}

/**
 * 21点
 * @param {String} msg 
 * @return {Void}
 */
function twentyOnePoint(msg) {
  if (CACHE_STATUS) {
    const end = dispatchCard(msg)
    if (end) gameStop()
  } else {
    CACHE_NAME = '21点'
    CACHE_STATUS = true
    initTwentyOnePoint(msg)
  }
}

/**
 * 领取低保
 * @param {String} name 
 * @returns {Void}
 */
async function getRewardAction(name) {
  const { data } = await getReward(name)
  switch (data.code) {
    case -1:
      replyMessage(getRandomReplyMsg(DICT.REWARD_MSG.NOT_GET))
      break;
    case 0:
      replyMessage(getRandomReplyMsg(DICT.REWARD_MSG.CAN_GET))
      break;
    case 1:
      replyMessage(getRandomReplyMsg(DICT.REWARD_MSG.HAS_GET))
      break;
  }
}

/**
 * 获取账户信息
 * @param {String} nickName account-name
 */
function getAccountInfo(nickName) {
  const nickNameURI = encodeURI(nickName)
  getAccount(nickNameURI)
    .then(response => {
      const res = response.data
      replyMessage(`账户：${res.nickName}\n余额：${res.balance}`)
    })
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

/**
 * 结束游戏
 * @param {String} stopMsg 
 */
async function gameStop(stopMsg = 'game over!') {
  CACHE_STATUS = false
  CACHE_NAME = ''
  delay(200)
  replyMessage(stopMsg)
}

module.exports = { handleMessage }