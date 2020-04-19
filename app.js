const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

/*
*   Переменные
*/

const token = process.env.BOT_TOKEN || '998168033:AAHjOK_VAGMEOvwx_iQBQDihbcv5w45eNEI';
const port = process.env.PORT || 8080;

/*
*   Сервер
*/

const server = express();

server.use(express.json());
server.use(express.urlencoded({extended: true}));

server.listen(port, function () {
    console.log(`Сервер запущен на ${port} порту\n`);
  });
  
  server.get('/', function (req, res) {
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.write(`Ваш IP: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}\n`);
    res.write('Точка интеграции ботов.');
    res.end();    
  });
  
  server.get('/api/:bot/:ver', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
    res.send('API для перенаправления запросов в Telegram.');
    console.log("==================START==================");
    //Проверка приложения
    console.log(`Bot = ${req.params["bot"]}, Version = ${req.params["ver"]}`);
    // switch(req.query.app){
    //   case "esed": 
    //     console.log(`Version = ${req.query.version}, UserId = ${req.query.userid}`);
    //     if (checkVer(req.query.userid, req.query.version) && check(req.query.userid)){
    //       esed(req.query.userid, req.query.to, req.query.type, req.query.number, req.query.url, req.query.text, req.query.subtext);        
    //     }
    //     break;      
    //   case "naumen":
    //     naumen();
    //     break;
    //   case "tg":
    //     tg(req.query.text);
    //     break;
    //   default:
    //     console.log("def");
    //     break;
    // }
    console.log("==================END==================\n");
  });

/*
*   Telegram
*/

process.env.NTBA_FIX_319 = 1;
const bot = new TelegramBot(token, {polling: true});

bot.on('message', (msg) => {
  console.log('================New Message================');  
  console.log(`UserID = ${msg.from.id}\nUsername = ${msg.from.username}`);
});

bot.onText(/\/user/, function (msg) { 
  var str = `<b>Ваши данные</b>:\n\nUser ID = <b>${msg.from.id}</b>`;
  sendMessage(msg.from.id, str);
});

