/*
 * @Author: Peanut
 * @Description:  处理用户消息
 * @Date: 2020-05-20 22:36:28
 * @Last Modified by: Peanut
 * @Last Modified time: 2021-04-19 22:02:53
 */
const path = require("path");
const { FileBox } = require("file-box");
// const superagent = require("../superagent");
// const config = require("../config");
const insertLog = require('../utils/log')

const allKeywords = `你好！`;
/**
 * sleep
 * @param {*} ms
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
/**
 * 处理消息
 */
async function onMessage(msg, bot) {
  //防止自己和自己对话
  if (msg.self()) return;
  const room = msg.room(); // 是否是群消息
  if (room) {
    //处理群消息
    await onWebRoomMessage(msg, bot);
  } else {
    //处理用户消息  用户消息暂时只处理文本消息。后续考虑其他
    console.log("bot.Message", bot.Message);
    const isText = msg.type() === bot.Message.Type.Text;
    if (isText) {
      await onPeopleMessage(msg, bot);
    }
  }
}
/**
 * 处理用户消息
 */
async function onPeopleMessage(msg, bot) {
  //获取发消息人
  const contact = msg.talker();
  //对config配置文件中 ignore的用户消息不必处理
  // if (config.IGNORE.includes(contact.payload.name)) return;
  let content = msg.text().trim(); // 消息内容 使用trim()去除前后空格
  let record = `${msg.text()}  ${contact} ${dayjs().format('HH:mm:ss')}`
  insertLog('log', record)

  if (content === "你好！") {
    await delay(200);
    await msg.say('Hi, i m chaty robot, A-YU!');
  } else {
    await delay(200);
    await msg.say('this is a auto message, conversation will save as log!');
  }
  // else if (content === "打赏") {
  //   //这里换成自己的赞赏二维码
  //   const fileBox = FileBox.fromFile(path.join(__dirname, "../imgs/pay.png"));
  //   await msg.say("我是秦始皇，打钱!!!!!");
  //   await delay(200);
  //   await msg.say(fileBox);
  // } else if (content === "技术交流群" || parseInt(content) === 1) {
  //   const webRoom = await bot.Room.find({
  //     topic: config.WEBROOM
  //   });
  //   if (webRoom) {
  //     try {
  //       await delay(200);
  //       await webRoom.add(contact);
  //     } catch (e) {
  //       console.error(e);
  //     }
  //   }
  // } else if (content === "毒鸡汤" || parseInt(content) === 2) {
  //   let soup = await superagent.getSoup();
  //   await delay(200);
  //   await msg.say(soup);
  // } else if (content === "神回复" || parseInt(content) === 3) {
  //   const { title, content } = await superagent.getGodReply();
  //   await delay(200);
  //   await msg.say(`标题：${title}<br><br>神回复：${content}`);
  // } else if (content === "英语一句话" || parseInt(content) === 4) {
  //   const { en, zh } = await superagent.getEnglishOne();
  //   await delay(200);
  //   await msg.say(`en：${en}<br><br>zh：${zh}`);
  // } else {
  //   const noUtils = await onUtilsMessage(msg, bot);
  //   if (noUtils) {
  //     await delay(200);
  //     await msg.say(allKeywords);
  //   }
  // }
}

/**
 * 处理群消息
 */
// async function onWebRoomMessage(msg, bot) {
//   const isText = msg.type() === bot.Message.Type.Text;
//   if (isText) {
//     const content = msg.text().trim(); // 消息内容

//   }
// }

module.exports = onMessage;