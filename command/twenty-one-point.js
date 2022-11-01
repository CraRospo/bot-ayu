const {
  replyMessage,
  delay,
  getPureRandomNumber,
  getRandomReplyMsg
} = require('../utils/utils')
const { settleAccount } = require('../api/message-command')
const DICT = require('../dict/index')

let CACHE_HEAP = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],
    CACHE_MEMBER = new Map(),
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
    FREEZE: false,
    OUT: false
  })

  CACHE_MEMBER.set(global['ContactSelf'].name(), {
    HEAP: [...CACHE_HEAP],
    CURRENT: [],
    COUNT: 0,
    EXTRA: 0,
    FREEZE: false,
    OUT: false
  })

  replyMessage('game start!')

  // 初始拿两张牌
  getCardRound()
  getCardRound()
  delay(200)
  replyMessage(getCardResultText())
  calculate() // 计算点数
  delay(300)
  comparePoint() // 计较结果
}

/**
 * 流程main
 * @param {String} msg 指令
 * @returns {Function} 
 */
 function dispatchCard(msg) {
  getTwentyOnePointCommand(msg) // 指令解析 - 拿牌/封牌
  replyMessage(getCardResultText()) // 返回拿牌结果和信息
  calculate() // 计算点数
  delay(300)
  return comparePoint() // 计较结果
}

/**
 * 21点内的 指令解析
 * @param {String} msg 指令
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
  // 修改用户拿牌状态
  CACHE_MEMBER.get(CACHE_CURRENT_CONTACT).FREEZE = true
  getCardRound()
}

// bot 的决断！
function judgement() {
  const point = CACHE_MEMBER.get(global['ContactSelf'].name()).COUNT
  const playerPoint = CACHE_MEMBER.get(CACHE_CURRENT_CONTACT).COUNT

  if (point > playerPoint && point > 16) {
    CACHE_MEMBER.get(global['ContactSelf'].name()).FREEZE = true
    console.log('封牌')
  }
}

/**
 * 拿牌逻辑
 * @param {String} character 拿牌者 
 * @returns {Void}
 */
function getCard(character) {
  // 随机获取一张index
  let cardIndex = getPureRandomNumber(CACHE_MEMBER.get(character).HEAP.length)

  // 从牌堆放入手牌
  try {
    CACHE_MEMBER.get(character).CURRENT.push(CACHE_MEMBER.get(character).HEAP[cardIndex])
  } catch (error) {
    CACHE_MEMBER.get(character).CURRENT = CACHE_MEMBER.get(character).HEAP[cardIndex]
  }

  // 从牌堆移除
  CACHE_MEMBER.get(character).HEAP.splice(cardIndex, 1)
}

// 根据游戏人数分发卡牌
function getCardRound() {
  judgement()
  if (CACHE_MEMBER.get(global['ContactSelf'].name()).FREEZE) replyMessage(`${global['ContactSelf'].name()}封牌`)
  delay(300)
  for(let [character, value] of CACHE_MEMBER.entries()) {
    if (!value.FREEZE) {
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

    console.log(member)

    if (member.EXTRA) {
      if(member.COUNT + 11 > 21 ) {
        member.COUNT = member.COUNT + 1
      } else {
        member.COUNT = member.COUNT + 11
      }
    }

    if(member.COUNT > 21) member.OUT = true
  }
}

// 比较胜负
function comparePoint() {

  // 计算没有爆点的人数
  const validMember = [...CACHE_MEMBER.entries()].filter(member => !member[1].OUT)
  const self = CACHE_MEMBER.get(global['ContactSelf'].name())
  const contact = CACHE_MEMBER.get(CACHE_CURRENT_CONTACT)
  let type = 0 // 结算类型 0 平局 1 结算为赢 -1 结算为输

  if (self.EXTRA && contact.EXTRA) {

    replyMessage('平局，此局无效！')
    return true
  }

  // 如果有人爆点
  if (validMember.length === 1) {

    // 判断胜者
    if (validMember[0][0] != CACHE_CURRENT_CONTACT) {
      type = -1
      replyMessage(getRandomReplyMsg(DICT.GAME_FAIL_TEXT))
    } else {
      type = 1
      replyMessage(getRandomReplyMsg(DICT.GAME_SUCCESS_TEXT))
    }

  } else if (validMember.length > 1) {
    if (self.COUNT > contact.COUNT && contact.FREEZE) {
      type = -1
    } else if (self.COUNT < contact.COUNT && self.FREEZE) {
      type = 1
    }
  } else {
    type = -1
  }

  // replyMessage(getRandomReplyMsg(DICT.GAME_FAIL_TEXT))

  if (type) {
    // 清除缓存
    CACHE_MEMBER.clear()
    delay(200)

    // 发送结算请求
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
      .catch(err => {
        replyMessage('结算异常！')
      })
    
    return true
  }
}

// 生成拿牌结果文字
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