const {
  replyMessage,
  delay,
  getPureRandomNumber,
  getRandomReplyMsg
} = require('../utils/utils')
const { settleAccount } = require('../api/message-command')
const DICT = require('../dict/index')

let CACHE_HEAP = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],
    CACHE_MEMBER = new Map()
    CACHE_BET_MONEY = 0,
    CACHE_CURRENT_CONTACT = ''

/**
 * 初始化
 * @param {Number|String} bet 赌注
 */
function init(bet) {
  CACHE_CURRENT_CONTACT = global['Message'].talker().name()
  CACHE_BET_MONEY = Number(bet) || 50
  CACHE_MEMBER.set(CACHE_CURRENT_CONTACT, {
    HEAP: [...CACHE_HEAP],
    CURRENT: [],
    COUNT: 0,
    EXTRA: 0,
    STOP: false,
    OUT: false
  })

  CACHE_MEMBER.set(global['ContactSelf'].name(), {
    HEAP: [...CACHE_HEAP],
    CURRENT: [],
    COUNT: 0,
    EXTRA: 0,
    STOP: false,
    OUT: false
  })

  replyMessage('game start!')
  getCardRound()
  getCardRound()
  delay(200)
  replyMessage(getCardResultText()) 
}

// 发牌
function dispatchCard(msg) {
  getTwentyOnePointCommand(msg)
  replyMessage(getCardResultText())
  calculate()
  return comparePoint()
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

// 封牌
function stopGetCard() {
  CACHE_MEMBER.get(CACHE_CURRENT_CONTACT).STOP = true
  getCardRound()
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
  for(let [character, value] of CACHE_MEMBER.entries()) {
    if (!value.STOP) {
      getCard(character)
    }
  }
}

// 计算最后的结果
function calculate() {
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

// 比较胜负
function comparePoint() {
  const validMember = [...CACHE_MEMBER.entries()].filter(member => !member[1].OUT)
  if (validMember.length === 1) {
    let type = 0
    if (validMember[0][0] === global['ContactSelf'].name()) {
      type = -1
      replyMessage(getRandomReplyMsg(DICT.GAME_FAIL_TEXT))

    } else {
      type = 1
      replyMessage(getRandomReplyMsg(DICT.GAME_SUCCESS_TEXT))
    }

    CACHE_MEMBER.clear()
    delay(200)
    settleAccount({
      nickName: CACHE_CURRENT_CONTACT,
      type,
      count: CACHE_BET_MONEY
    })
      .then(res => {
        if (res.data.code === 0) {
          replyMessage(`您${type > 0 ? '赢得' : '输掉' }了赌注${CACHE_BET_MONEY}币`)
        }
      })
    return true
  } 
  
}

// 拿牌结果
function getCardResultText() {
  let res = ''
  for (let [character, value] of CACHE_MEMBER.entries()) {
    res += `${character} 拿到的牌： ${value.CURRENT} \n`
  }

  return res
}

module.exports = {
  init,
  dispatchCard
}