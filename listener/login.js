/*
 * @Author: Peanut
 * @Description:  登录
 * @Date: 2020-05-20 23:21:06
 * @Last Modified by: Peanut
 * @Last Modified time: 2021-04-19 22:07:28
 */
const schedule = require("node-schedule")
const config = require("../config")
const insertLog = require('../utils/log')
/**
 * @description 您的机器人上线啦
 * @param {} user
 */
async function onLogin(user, bot) {
  console.log(`贴心小助理${user}登录了`);
  insertLog({ action: 'Login', content: user })
  sendTips(bot)
}
/**
 * 9点定时给指定群发送消息
 */
async function sendTips(bot) {
  //匹配规则可参考 schedule/index.js
  const time = "00 00 * * * *";
  schedule.scheduleJob(time, async () => {
    const room = await bot.Room.find({
      topic: config.WEBROOM
    });

    const str = `我是提醒喝水小助手。\n 工作辛苦啦，现在请你站起身来，去喝一杯水。\n 保持走动，有益健康哟。\n 我会每个小时都来提醒大家的！`
    await room.say(str);
  });
}

module.exports = onLogin