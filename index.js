require('dotenv').config()

/*
*   MongoDB
*/

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://" + process.env.MDB_USER + ":" + process.env.MDB_PASS + "@minare0.eswxz.mongodb.net/";

async function MDBFindOne(db, coll, filter) {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true });
    const collection = client.db(db).collection(coll);
    const result = await collection.findOne(filter);
    client.close();
    return result;
}

async function MDBFind(db, coll, filter) {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true });
    const collection = client.db(db).collection(coll);
    const result = await collection.find(filter).toArray();
    client.close();
    return result;
}

async function MDBInsertOne(db, coll, data) {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true });
    const collection = client.db(db).collection(coll);
    const result = await collection.insertOne(data);
    client.close();
    return result;
}
//await MDBInsertOne(process.env.MDB_ESED_DB, 'status', data);    

/*
*   Сервер
*/

const express = require('express')
const server = express()
const cors = require('cors')
const port = process.env.PORT || 3000

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.listen(port, function () {
    console.log(`Сервер запущен на ${port} порту\nРежим: ${process.env.MODE}\n`);
});

/*
*   API
*/

server.get('/', function (req, res) {
    res.send('Точка интеграции ботов.');
});

//  ESED

server.get('/api/esed', function (req, res) {
    res.json({ version: process.env.SCRIPT_VERSION });
});

server.post('/api/esed', function (req, res) {    
    res.status(200).json({ 'status': 'OK' });
    esed(req.body);
});

/*
*   Telegram
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

bot.onText(/\/ban/, async (msg) => {
    console.log('================Ban Message================');
    const list = await MDBFind(process.env.MDB_ESED_DB, 'esed', { tg: '' });
    let str = '';
    list.forEach(item => {
        str += item.name + '\n';
    });
    sendMessage(msg.from.id, str);
});

bot.onText(/\/info/, async (msg) => {
    sendMessage(msg.from.id, "Ваш Telegram ID = " + msg.from.id);
});

// bot.on('message', (msg) => {
//     console.log('================New Message================');
//     console.log(`UserID = ${msg.from.id}\nUsername = ${msg.from.username}\nMsg = ${msg.text}`);
//     bot.sendMessage(msg.from.id, msg.text);
// });

const debug = process.env.BOT_PRIVATE;

/*
*   Functions
*/

async function esed(data) {
    //Точка входа
    console.log("==================ESED==================");
    console.log(data);
    //Ссылка на РК и Автора
    let str = `<a href=\"${data.url}\">${data.title}</a>\n================\n<a href="tg://user?id=${data.from}">`;
    console.log("=================MongoDB=================");
    const info = await MDBFindOne(process.env.MDB_ESED_DB, 'users', { "tg": data.from });
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
            const item = await MDBFindOne(process.env.MDB_ESED_DB, 'users', { name: authors[i] });
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
                const item = await MDBFindOne(process.env.MDB_ESED_DB, 'users', { name: authors[i] });
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
            const item = await MDBFindOne(process.env.MDB_ESED_DB, 'users', { name: data.author });
            if (item.super) {
                if (data.text != undefined) {
                    str += data.text;
                }
                else {
                    str += 'Введен пустой отчет!';
                }
                if (process.env.MODE == 'debug') {
                    sendMessage(debug, str);
                }
                else {
                    sendMessage(item.tg, str);
                }
            }
            else {
                if (data.text != undefined && !reg.test(data.text.substring(0, 10).toLowerCase())) {
                    str += data.text;
                    if (process.env.MODE == 'debug') {
                        sendMessage(debug, str);
                    }
                    else {
                        sendMessage(item.tg, str);
                    }
                }
            }
        }
    }
}

async function sendMessage(chatId, message) {
    console.log("==================Telegram=================="); 
    bot.sendMessage(chatId, message, { disable_web_page_preview: true, parse_mode: "HTML" }).catch((error) => {
        bot.sendMessage(debug, error, { disable_web_page_preview: true, parse_mode: "HTML" });
    });
    console.log(`Сообщение отправлено.`);
}
