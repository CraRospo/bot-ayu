const fs = require('fs');
const path = require('path')
const dayjs = require("dayjs");
const fsPromises = fs.promises;

/**
 * 写log
 * @param {String} type 写入log的type 'error' | 'log'
 * @param {String} action 写入动作
 * @param {String} content 写入的内容
 * @return {Void}
 */
async function insertLog({
  type = 'log',
  action,
  content
}) {
  const dateStr = dayjs().format('YYYYMMDD')
  const dirPath = path.join(`./log/${dateStr}`)
  const filePath = path.join(dirPath, `/${dateStr}-${type}.txt`)
  const infomation = logTextFormat(action, content)
  try {
    // check log dir
    await fsPromises.access(dirPath, fs.constants.F_OK)
  } catch {
    console.log(1)
    await fsPromises.mkdir(dirPath)
  }

  try {
    // write file
    fsPromises.appendFile(filePath, infomation)
  } catch (error) {
    console.log(error)
    fsPromises.appendFile(filePath, error)
  }
}

function logTextFormat(action, content) {
  const time = dayjs().format('HH:mm:ss')
  return `[${action}]: ${content} ${time} \n`
}

module.exports = insertLog