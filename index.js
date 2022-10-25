const { WechatyBuilder } = require("wechaty");

const onScan = require("./listener/scan.js");
const onLogin = require("./listener/login.js");
const onMessage = require("./listener/message.js");
const onFriendship = require("./listener/friendship.js");
const onError = require("./listener/error.js");

const bot = WechatyBuilder.build({
  name: "ayu",
  puppet: "wechaty-puppet-wechat",
  puppetOptions: {
    uos: true,
  },
});

global['ContactSelf'] = null
global['Message'] = null

bot.on("login", async user => {
  global['ContactSelf'] = user
  onLogin(user, bot);
});
bot.on("message", async msg => {
  if (msg.self()) return 
  global['Message'] = msg
  onMessage(msg, bot);
});
bot.on("scan", async (qrcode, status) => {
  onScan(qrcode, status);
});
bot.on("friendship", async friendship => {
  onFriendship(friendship, bot);
});
bot.on("error", (error) => {
  onError(error)
})

bot
  .start()
  .then(() => console.log("开始登陆微信"))
  .catch(e => console.error(e));