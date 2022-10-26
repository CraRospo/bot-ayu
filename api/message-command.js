const { getMethod, postMethod } = require('../utils/request')

// 获取账户信息
function getAccount(nickName) {
  return getMethod('/member/account', { nickName })
}

// 结算账户
function settleAccount(data) {
  return postMethod('/member/settle', data)
}

// 获取低保
function getReward(nickName) {
  return postMethod('/member/reward', { nickName })
}

module.exports = {
  getAccount,
  settleAccount,
  getReward
}