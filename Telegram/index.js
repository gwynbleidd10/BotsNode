module.exports = {
    sendMessage: sendMessage,
}

console.log('================Telegram=init================');
const MDB = require('../MongoDB')    //Mongo DB module

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot((process.env.MODE == 'debug') ? process.env.BOT_TEST : process.env.BOT_PROD, { polling: true });

bot.on('polling_error', (error) => {
    console.error(error.code);
    console.error(error.response.body);
});

bot.onText(/\/ban/, async (msg) => {
    //console.log('================Ban Message================');
    const list = await MDB.Find(process.env.MDB_ESED_DB, 'users', { tg: '' });
    let str = '';
    list.forEach(item => {
        str += item.name + '\n';
    });
    sendMessage(msg.from.id, str);
});

bot.onText(/\/info/, async (msg) => {
    sendMessage(msg.from.id, "Ваш Telegram ID = " + msg.from.id);
});

async function sendMessage(chatId, message) {
    (process.env.MODE == "debug") ? console.log("==================Telegram==================") : '';
    chatId = (chatId == "debug") ? process.env.BOT_DEBUG : chatId;
    const res = await bot.sendMessage(chatId, message, { disable_web_page_preview: true, parse_mode: "HTML" }).catch((error) => {
        bot.sendMessage(process.env.BOT_DEBUG, "Error code:\n" + error.code + "\nError body:\n" + JSON.stringify(error.response.body) + "\nMessage:\n" + message, { disable_web_page_preview: true, parse_mode: "HTML" });
    });
    return (await res != undefined) ? 'Сообщение успешно отправлено' : 'Возникла ошибка при отправке сообщения';
}