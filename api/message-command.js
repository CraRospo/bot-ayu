const { getMethod, postMethod } = require('../utils/request')

// 获取账户信息
function getAccount(name) {
  return getMethod('/member/account', { name })
}

function settleAccount(data) {
  return postMethod('/member/settle', data)
}

module.exports = {
  getAccount,
  settleAccount
}