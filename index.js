/*
------------------------------------------------------------------------------------------------------
------------------------------------------------Init--------------------------------------------------
------------------------------------------------------------------------------------------------------
*/

require('dotenv').config()    //.env
const MDB = require('./MongoDB')    //Mongo DB module

/*
------------------------------------------------------------------------------------------------------
----------------------------------------------Express-------------------------------------------------
------------------------------------------------------------------------------------------------------
*/

const express = require('express')
const server = express()
const cors = require('cors')
const port = process.env.PORT || 3000

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.listen(port, function () {
    console.log(`Express port: ${port}\nMode: ${process.env.MODE}\n`);
});

/*
*   API
*/

server.get('/', function (req, res) {
    res.send('Точка интеграции ботов.');
});

server.get('/ping', function (req, res) {
    res.status(200).json({ status: "OK" });
});

//  ESED

server.get('/api/esed', function (req, res) {
    res.json({ version: process.env.SCRIPT_VERSION });
});

server.get('/api/esed/version', function (req, res) {
    res.json({ version: process.env.SCRIPT_VERSION });
});

server.post('/api/esed', function (req, res) {
    res.status(200).json({ 'status': 'OK' });
    esed(req.body);
});

/*
------------------------------------------------------------------------------------------------------
---------------------------------------------Telegram-------------------------------------------------
------------------------------------------------------------------------------------------------------
*/

let token;
if (process.env.MODE == 'debug') {
    token = process.env.BOT_TEST;
}
else {
    token = process.env.BOT_PROD;
}
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(token, { polling: true });

bot.on('polling_error', (error) => {
    console.log(error.code);  // => 'EFATAL'
});

bot.onText(/\/ban/, async (msg) => {
    console.log('================Ban Message================');
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
    console.log("==================Telegram==================");
    const res = await bot.sendMessage(chatId, message, { disable_web_page_preview: true, parse_mode: "HTML" }).catch((error) => {
        bot.sendMessage(debug, "Error code:\n" + error.code + "\nError body:\n" + JSON.stringify(error.response.body) + "\nMessage:\n" + message, { disable_web_page_preview: true, parse_mode: "HTML" });
    });
    let error = false;
    if (res) {
        console.log(`Сообщение отправлено.`);
    }
    else {
        error = true;
    }
    if (error) {

    }
    else {

    }
    //await MDB.InsertOne(process.env.MDB_ESED_DB, 'status', {});
}

const debug = process.env.BOT_PRIVATE;

/*
------------------------------------------------------------------------------------------------------
---------------------------------------------Functions------------------------------------------------
------------------------------------------------------------------------------------------------------
*/

async function esed(data) {
    //Точка входа
    console.log("==================ESED==================");
    console.log(data);
    //Ссылка на РК и Автора
    let str = `<a href=\"${data.url}\">${data.title}</a>\n================\n<a href="tg://user?id=${data.from}">`;
    const info = await MDB.FindOne(process.env.MDB_ESED_DB, 'users', { "tg": data.from });
    console.log(info)
    if (info !== null) {
        str += `${info.name}</a> `;
    }
    else {
        str += `Неизвестный пользователь</a> `;
    }
    //Проверка типа сообщения
    if (data.type == 'visa' || data.type == 'sign') {
        if (data.type == 'visa') {
            str += `<i>завизировал(а)</i>\n================\n<i>${data.status}</i>`;
        }
        else {
            str += `<i>подписал(а)</i>\n================\n<i>${data.status}</i>`;
        }
        if (data.comment != undefined) {
            str += `\n================\n<i>Комментарий</i>: ${data.comment}`;

        }
        let authors = data.author.split(',');
        for (var i = 0; i < authors.length; i++) {
            const item = await MDB.FindOne(process.env.MDB_ESED_DB, 'users', { name: authors[i] });
            if (item !== null) {
                if (process.env.MODE == 'debug') {
                    sendMessage(debug, str);
                }
                else {
                    sendMessage(item.tg, str);
                }
            }

        }
    }
    else if (data.type == 'visa-send' || data.type == 'sign-send') {
        if (data.type == 'visa-send') {
            str += `<i>отправил(а) на визу</i>\n================`;
        }
        else {
            str += `<i>отправил(а) на подпись</i>\n================`;
        }
        if (info == undefined || !info.super) {
            let authors = data.list.split(',');
            let tmp = '', list = [];
            for (let i = 0; i < authors.length; i++) {
                const item = await MDB.FindOne(process.env.MDB_ESED_DB, 'users', { name: authors[i] });
                if (item !== null) {
                    tmp += `\n<a href="tg://user?id=${item.tg}">${item.name}</a>`;
                    list.push(item.tg);
                }
                else {
                    tmp += '\n' + authors[i];
                }
            }
            for (let i = 0; i < list.length; i++) {
                if (process.env.MODE == 'debug') {
                    sendMessage(debug, str);
                }
                else {
                    sendMessage(list[i], str + tmp);
                }
            }
        }
    }
    else {
        let reg = new RegExp(/.*ознакомлен.*/i);
        if (info == undefined || !info.super) {
            str += `<i>ввел(а) отчет:</i>\n================\nСтатус: <i>${data.status}</i>\n\n`;
            const item = await MDB.FindOne(process.env.MDB_ESED_DB, 'users', { name: data.author });
            // if (item.super) {
            //     if (data.text != undefined) {
            //         str += data.text;
            //     }
            //     else {
            //         str += 'Введен пустой отчет!';
            //     }
            //     if (process.env.MODE == 'debug') {
            //         sendMessage(debug, str);
            //     }
            //     else {
            //         sendMessage(item.tg, str);
            //     }
            // }
            // else {
            if (data.text != undefined && !reg.test(data.text.substring(0, 10).toLowerCase())) {
                str += data.text;
                if (process.env.MODE == 'debug') {
                    setTimeout(() => {
                        console.log(str + '\n\n' + info)
                        //sendMessage(debug, str + '\n\n' + info);
                    }, 10000);

                }
                else {
                    sendMessage(item.tg, str);
                }
            }
            // }
        }
    }
}
