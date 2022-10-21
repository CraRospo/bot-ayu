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

let CACHE_NUMBER = 0,
    CACHE_STATUS = false,
    CACHE_NAME = '',
    CACHE_HEAP = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],
    CACHE_MEMBER = new Map()


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
    await replyMessage(randomMsg);
    return 
  }

  CACHE_CURRENT_CONTACT = args[0]
  getCommandType(name, value)
  
}

/**
 * 执行指令
 * @param {String} name 
 * @param {String} msg 
 * @returns {Function}
 */
function getCommandType(name, msg) {
  // 指令handle
  switch (name) {
    case '更换名字':
      return renameBot(msg)
    case '猜数字':
      return guessNumber(msg)
    case '21点':
      return twentyOnePoint(msg)
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
    replyMessage(guess(msg))
  } else {
    const limit = msg || 100
    const num = Math.ceil(Math.random() * limit)
    CACHE_NUMBER = num
    CACHE_STATUS = true
    CACHE_NAME = '猜数字'

    replyMessage('game start!')
  }
}


/**
 * 比较number
 * @param {String} num 
 * @returns {String} 比较结果
 */
function guess(num) {
  const number = Number(num)
  if (Number.isNaN(number)) return getRandomReplyMsg(DICT.UNKNOWN_PARAMS_TEXT)
  if (number === CACHE_NUMBER) return getRandomReplyMsg(DICT.GAME_SUCCESS_TEXT)
  if (number < CACHE_NUMBER) return '小了！'
  if (number > CACHE_NUMBER) return '大了！'
}

/**
 * 21点内的 指令解析
 * @param {String} msg 
 * @returns {Function}
 */
function getTwentyOnePointCommand(msg) {
  switch (msg) {
    case '拿牌':
      return getCardRound()
    case '封牌':
      return stopGetCard()
  }
}

/**
 * 获取随机数
 * @param {Number} limit 随机数最大值
 * @returns {Number}
 */
function getPureRandomNumber(limit) {
  return Math.floor(Math.random() * limit)
}

/**
 * 拿牌
 * @param {String} character 拿牌者 
 * @returns {Void}
 */
function getCard(character) {
  let cardIndex = getPureRandomNumber(CACHE_MEMBER.get(character).HEAP.length)
  try {
    CACHE_MEMBER.get(character).CURRENT.push(CACHE_MEMBER.get(character).HEAP[cardIndex])
  } catch (error) {
    CACHE_MEMBER.get(character).CURRENT = CACHE_MEMBER.get(character).HEAP[cardIndex]
  }
  CACHE_MEMBER.get(character).HEAP.splice(cardIndex, 1)
}

// 拿牌回合
function getCardRound() {
  for(let character of CACHE_MEMBER.keys()) {
    getCard(character)
  }
}

// 计算最后的结果
async function calculate() {
  // calc-array.clone() extra-计算A count-点数合计
  for (let member of CACHE_MEMBER.values()) {
    let calc = [...member.CURRENT]
    if (member.CURRENT.includes('A')) {
      calc.splice(member.CURRENT.findIndex(item => item === 'A'), 1)
      member.EXTRA = 1
    }

    // 计算点数 JQK 为10点
    member.COUNT = calc.reduce((prev, next) => {
      const nextNumber = Number(next)
      const trans = Number.isNaN(nextNumber) ? 10 : nextNumber
      return prev + trans
    }, 0)

    if (member.COUNT + member.EXTRA > 21) member.OUT = true
  }
}

async function comparePoint() {
  const validMember = [...CACHE_MEMBER.entries()].filter(member => !member[1].OUT)
  if (validMember.length === 1 && validMember[0][0] === global['ContactSelf'].name()) return gameStop(getRandomReplyMsg(DICT.GAME_FAIL_TEXT))
  else return gameStop(getRandomReplyMsg(DICT.GAME_SUCCESS_TEXT))
}

// 拿牌结果
function getCardResultText() {
  let res = ''
  for (let [character, value] of CACHE_MEMBER.entries()) {
    res += `${character} 拿到的牌： ${value.CURRENT} \n`
  }

  return res
}

/**
 * 21点
 * @param {String} msg 
 * @return {Void}
 */
async function twentyOnePoint(msg) {
  if (CACHE_STATUS) {
    getTwentyOnePointCommand(msg)

    await replyMessage(getCardResultText())
    await calculate()
    await comparePoint()
    


  } else {
    CACHE_NAME = '21点'
    CACHE_STATUS = true
    CACHE_MEMBER.set(CACHE_CURRENT_CONTACT, {
      HEAP: CACHE_HEAP,
      CURRENT: [],
      COUNT: 0,
      EXTRA: 0,
      OUT: false
    })

    CACHE_MEMBER.set(global['ContactSelf'].name(), {
      HEAP: CACHE_HEAP,
      CURRENT: [],
      COUNT: 0,
      EXTRA: 0,
      OUT: false
    })
  
    await replyMessage('game start!')
    getCardRound()
    getCardRound()

    replyMessage(getCardResultText()) 
  }
}

/**
 * 发送消息
 * @param {String} msg
 * @return {Void}
 */
async function replyMessage(msg) {
  await delay(500);
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

/**
 * 结束游戏
 * @param {String} stopMsg 
 */
async function gameStop(stopMsg = 'game over!') {
  CACHE_NUMBER = 0
  CACHE_STATUS = false
  CACHE_NAME = ''
  CACHE_MEMBER.clear()
  await replyMessage(stopMsg)
}

module.exports = {
  handleMessage,
  replyMessage,
  renameBot
}