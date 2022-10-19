const insertLog = require('../utils/log');

/**
 * 错误信息
 */
async function onError(error) {
  await insertLog({
    type: 'err',
    action: 'Error',
    content: error
  });
}

module.exports = onError