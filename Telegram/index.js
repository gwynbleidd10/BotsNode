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

bot.onText(/\/start/, (msg) => {
    sendMessage(msg.from.id, start(msg.from.id))
    checkId(msg.from.id)
})

bot.onText(/\/info/, async (msg) => {
    sendMessage(msg.from.id, start(msg.from.id))
    checkId(msg.from.id)
})

bot.onText(/\/dept/, async (msg) => {
    let user = await User.findOne({ tg: msg.from.id })
    bot.sendMessage(msg.from.id, 'Ваш текущий отдел: <i>' + user.dept + '</i>', { disable_web_page_preview: true, parse_mode: "HTML" })
})

bot.onText(/\/setdept ([0-9]+)/, async (msg, match) => {
    let str = 'Нет такого номера отдела!'
    bot.sendMessage(msg.from.id, 'Проверяю...')
    switch (match[1]) {
        case ('1'):
            res = await User.updateOne({ tg: msg.from.id }, { dept: 'Руководство' })
            str = 'Отдел успешно установлен в: <i>Руководство</i>'
            break
        case ('2'):
            res = await User.updateOne({ tg: msg.from.id }, { dept: 'УЦТ' })
            str = 'Отдел успешно установлен в: <i>УЦТ</i>'
            break
        case ('3'):
            res = await User.updateOne({ tg: msg.from.id }, { dept: 'ОРиСИС' })
            str = 'Отдел успешно установлен в: <i>ОРиСИС</i>'
            break
    }
    bot.sendMessage(msg.from.id, str, { disable_web_page_preview: true, parse_mode: "HTML" })
})

function start(id) {
    let str = '<b>Ваш Telegram ID</b> = <i>' + id + '</i>\n\n'
    str += 'Для установки скрипта требуется:\n'
    str += '1)Отправить боту номер своего отедала (подробное описание в следующем сообщении)\n'
    str += '2)Установить расширение для своего браузера по <a href="https://www.tampermonkey.net">ссылке</a>\n'
    str += '3)Перейти по <a href="https://github.com/gwynbleidd10/userscripts/raw/master/ESEDtoTG.user.js">ссылке</a> и установить скрипт\n'
    str += '4)Включить расширение и включить скрипт! При следующем заходе на сайт ESED\'а скрипт попросит ввести полученый ранее Telegram ID от бота.'
    return str
}

async function checkId(chatId) {
    const user = await User.findOne({ tg: chatId })
    if (!user) {
        await User.create({ tg: chatId })
    }
    if (!user.dept) {
        let str = ''
        str += 'Проверьте, правильно ли у вас установлен отдел. Для этого введите команду "/dept". '
        str += 'Если отдел неверный, то введите номер своего отдела командой "/setdept НОМЕР_ОТДЕЛА".\n'
        str += '(Для выбора УЦТ необходимо ввести команду "/setdept 2")\n\n'
        str += 'Номера отделов:\n'
        str += '1 - Руководство\n'
        str += '2 - УЦТ\n'
        str += '3 - ОРиСИС\n'
        bot.sendMessage(chatId, str, { disable_web_page_preview: true, parse_mode: "HTML" })
    }
}

// bot.on('message', async (msg) => {
//     checkId(msg.from.id)
// })

async function sendMessage(chatId, message) {
    chatId = (chatId == "debug") ? process.env.BOT_DEBUG : chatId
    const res = await bot.sendMessage(chatId, message, { disable_web_page_preview: true, parse_mode: "HTML" }).catch((error) => {
        bot.sendMessage(process.env.BOT_DEBUG, "Error code:\n" + error.code + "\nError body:\n" + JSON.stringify(error.response.body) + "\nMessage:\n" + message, { disable_web_page_preview: true, parse_mode: "HTML" })
    })
    return (await res != undefined) ? { status: true, message: 'Сообщение успешно отправлено' } : { status: false, message: 'Возникла ошибка при отправке сообщения' }
}