const fs = require('fs');
const path = require('path')
const dayjs = require("dayjs");
const fsPromises = fs.promises;

/**
 * 写log
 * @param {String} logType 写入log的type 'error' | 'log'
 * @param {String} content 写入的内容
 * @return {Void}
 */
async function insertLog(logType = 'log', content) {
  const dateStr = dayjs().format('YYYYMMDD')
  const dirPath = path.join(`./log/${dateStr}`)
  const filePath = path.join(dirPath, `/${dateStr}-${logType}.txt`)
  const infomation = content + '\n'

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

module.exports = insertLog