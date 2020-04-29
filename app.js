const fs = require('fs');
const parser = require('fast-xml-parser');
const fileupload = require('express-fileupload');


console.log(process.env.v_apc);
/*
*   Базы
*/

// const { Pool } = require('pg');
// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
//     ssl: true
// });

/*
*   Списки
*/

const vars = require('./vars');

/*
*   Telegram
*/

process.env.NTBA_FIX_319 = process.env.NTBA_FIX_350 = 1;
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});

console.log('Бот запущен!');

bot.onText(/\/start/, function (msg) { 
    var str = `<b>Привет нигер, твои данные</b>:\n\nUser ID = <b>${msg.from.id}</b>`;
    sendMessage(msg.from.id, str);
});

bot.onText(/\/status/, function (msg) {  
    apcCheck("status", msg.chat.id);  
});

bot.onText(/\/service/, function (msg) {
    if (vars.admins.includes(msg.from.id.toString())){
        vars.service = !vars.service;
        console.log(vars.service);
        str = '<b>Техобслуживание</b>:\n';
        if (vars.service)
            str += '\n<i>Включено</i>';
        else
            str += '\n<i>Выключено</i>';
        str += ` пользователем <a href="tg://user?id=${msg.from.id}">${msg.from.first_name} ${msg.from.last_name}</a>`;
        sendMessage(process.env.chat_apc,  str);  
    }
    else{
        sendMessage(msg.from.id,  'У вас недостаточно прав для пользования данной команды!'); 
    }    
});

bot.onText(/\/user/, function (msg) { 
    var str = `<b>Ваши данные</b>:\n\nUser ID = <b>${msg.from.id}</b>`;
    sendMessage(msg.from.id, str);
});

bot.on('message', (msg) => {
    console.log('================New Message================');  
    console.log(`UserID = ${msg.from.id}\nUsername = ${msg.from.username}`);
    //const stream = fs.createReadStream('test.txt');
    //bot.sendDocument(msg.from.id, stream);
});

bot.on('polling_error', (error) => {
    console.log(error);
  });

function sendMessage(chat, message){
    bot.sendMessage(chat, message, {disable_web_page_preview : true, parse_mode : "HTML"});
}

/*
*   Сервер
*/

const express = require('express');
const server = express();

server.use(fileupload());
server.use(express.json());
server.use(express.urlencoded({extended: true}));

server.listen(process.env.PORT, function () {
    console.log(`Сервер запущен на ${process.env.PORT} порту\n`);
});
  
server.get('/', function (req, res) {
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.write(`Ваш IP: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}\n`);
    res.write('Точка интеграции ботов.');
    res.end();    
});
  
server.get('/api/:bot', async (req, res) => {
    console.log("=================GET request================");
    console.log(`Bot = ${req.params["bot"]}`);
    console.log("=====================START===================");
    switch(req.params["bot"]){
        case "apc": 
            //res.json(await database("query", "SELECT * FROM errors order by id desc limit 20"));
            res.send("apc");
            break;      
        case "esed":
            res.send("esed");
            break;
        default:
            console.log("def");
            break;
    }
    console.log("=====================END===================\n");
});

server.post('/api/:bot/:ver', function (req, res) {
    console.log("=================POST request================");
    console.log(`Bot = ${req.params["bot"]}, Version = ${req.params["ver"]}`);
    console.log("=====================START===================");
    switch(req.params["bot"]){
        case "apc":
            //for (var i of req.files['']){
                var i = req.files[''];
                jsonObj = parser.parse(i.data.toString(), vars.options);

                //database("insert", "INSERT INTO errors(error) VALUES('" + body + "')");        

                console.log(i.mimetype, i.name);
                //console.log(jsonObj["variable-set"]);
                if (jsonObj["variable-set"] != undefined){
                    console.log(`Ошибка: ${jsonObj["variable-set"]["variable"][6]['metadata'][1]["nls-string-val"]}`);
                    if (!vars.service){
                        bot.sendMessage(vars.chat_apc, `Ошибка: ${jsonObj["variable-set"]["variable"][6]['metadata'][1]["nls-string-val"]}`, {parse_mode : "HTML"}).then(() => {
                            //const stream = fs.readFileSync('test.xml');                      
                            bot.sendDocument(vars.chat_apc, i.name);
                        });
                    };   
                }      
                //console.log(jsonObj);    
                
                // async function database(type, query){
//     try {
//             const client = await pool.connect()
//             const result = await client.query(query);
//             client.release(); 
//             if (type == "query"){
//                 var results = { 'results': (result) ? result.rows : null};       
//                 return results;      
//             }       
//         } catch (err) {            
//             console.error(err);
//             res.send("Error " + err);
//         }
// }

            //}
            break;      
        case "esed":
            esed();
            break;
        default:
            console.log("def");
            break;
    }
    res.status(200).send("OK");
    console.log("=====================END===================\n");
});

/*
*   Apc
*/

const ping = require('node-http-ping');

const apc_url = ['rcitsakha.ru', 'sakha.gov.ru', 'e-yakutia.ru', 'dom.e-yakutia.ru'];
var apc_ms = [0, 0, 0, 0], apc_count = [0, 0, 0, 0], apc_err = [false, false, false, false], apc_end = [false, false, false, false], apc_enter = false;

apcCheck('timer');
setInterval(apcCheck, 30000, 'timer');

function apcSend(type, i){
    switch (type) {        
        case 'status':
            str = '<b>Статус сайтов: </b>\n';
            apc_ms.forEach(function(item, i){
                if (item != '0'){
                    str += `\n<a href=\"https://${apc_url[i]}/\">${apc_url[i]}</a> - <i>${item}ms</i>`;
                }
                else
                {
                    str += `\n<a href=\"https://${apc_url[i]}/\">${apc_url[i]}</a> - <i>Не овечает</i>`;
                }
            });
            str += '\n\n<b>Техобслуживание: </b>\n';
            if (vars.service)
            {
                str += '\nВключено';
            }
            else
            {
                str += '\nВыключено';
            }
            sendMessage(i, str);
            break;    
        case 'on':
            str = `Восстановлено соединение с:\n\n<a href=\"https://${apc_url[i]}/\">${apc_url[i]}</a>`;         
            sendMessage(vars.chat_apc, str);
            break;  
        case 'off':
            str = `Потеряно соединение с:\n\n<a href=\"https://${apc_url[i]}/\">${apc_url[i]}</a>`;
            sendMessage(vars.chat_apc, str);
            break;   
        default:
            break;
    }
}

function apcAction(type, msgId){
    if ((apc_end[0] == true) && (apc_end[1] == true) && (apc_end[2] == true) && (apc_end[3] == true)){
        apc_enter = false;
        apc_end[0] = apc_end[1] = apc_end[2] = apc_end[3] = false;
        if (type == 'status'){
            apcSend('status', msgId);
        }
        apc_ms.forEach(function(item, i){
            if (apc_ms[i] == 0){
                if (!apc_err[i]){
                    if (apc_count[i] > 0){
                        apc_err[i] = !apc_err[i]; 
                        apcSend('off', i);
                    }
                    else
                    {
                        apc_count[i]++; 
                    }                           
                }
            }
            else
            {
                apc_count[i] = 0;
                if (apc_err[i]){
                    apc_err[i] = !apc_err[i];
                    apcSend('on', i);
                }
            }
        });     
    }     
}

function apcCheck(type, msgId){
    if (apc_enter == false){
        apc_enter = true;
        apc_url.forEach(function (host) {
            ping(host)
            .then(time => {
                apc_ms[apc_url.indexOf(host)] = time;
                apc_end[apc_url.indexOf(host)] = true;
                apcAction(type, msgId);    
                //console.log("OK: " + host + ', ping: ' + time + ', ms: ' + ms); 
                //console.log(end);           
            })
            .catch((err) => {
                apc_ms[apc_url.indexOf(host)] = 0;
                apc_end[apc_url.indexOf(host)] = true;
                apcAction(type, msgId);    
                //console.log("ERR: " + host + ', ms: ' + ms);    
                //console.log(end);        
            });   
        })    
    }
    if (type == 'status'){
        apcSend('status', msgId);
    }
}

/*
*   Esed
*/
