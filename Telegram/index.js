module.exports = {
    sendMessage: sendMessage,
}

const User = require('../models/User')

console.log('================Telegram=init================')

const TelegramBot = require('node-telegram-bot-api')
const bot = new TelegramBot((process.env.MODE == 'debug') ? process.env.BOT_TEST : process.env.BOT_PROD, { polling: true })

bot.on('polling_error', (error) => {
    console.error(error.code)
    console.error(error.response.body)
});

bot.onText(/\/info/, async (msg) => {
    let str = '<b>Ваш Telegram ID</b> = <i>' + msg.from.id + '</i>\n\n'
    str += 'Для установки скрипта требуется:\n'
    str += '1)Установить расширение для своего браузера по <a href="https://www.tampermonkey.net">ссылке</a>\n'
    str += '2)Перейти по <a href="https://github.com/gwynbleidd10/userscripts/raw/master/ESEDtoTG.user.js">ссылке</a> и установить скрипт\n'
    str += '3)Включить расширение и включить скрипт! При следующем заходе на сайт ESED\'а скрипт попросит ввести полученый ранее Telegram ID от бота.'
    sendMessage(msg.from.id, str)
    checkId(msg.from.id)
});

async function checkId(chatId) {
    const user = await User.findOne({ tg: chatId })
    if (!user) {
        await User.create({ tg: chatId })
    }
}

async function sendMessage(chatId, message) {
    chatId = (chatId == "debug") ? process.env.BOT_DEBUG : chatId
    const res = await bot.sendMessage(chatId, message, { disable_web_page_preview: true, parse_mode: "HTML" }).catch((error) => {
        bot.sendMessage(process.env.BOT_DEBUG, "Error code:\n" + error.code + "\nError body:\n" + JSON.stringify(error.response.body) + "\nMessage:\n" + message, { disable_web_page_preview: true, parse_mode: "HTML" })
    })
    return (await res != undefined) ? { status: true, message: 'Сообщение успешно отправлено' } : { status: false, message: 'Возникла ошибка при отправке сообщения' }
}