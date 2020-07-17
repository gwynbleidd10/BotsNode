module.exports = {
    esed: esed
}

const MDB = require('../MongoDB')    //Mongo DB module
const TG = require('../Telegram')    //Telegram module

console.log('===============Functions=init================');

function getTime() {
    let local = new Date().format("yyyy-MM-ddThh:mm:ss");
    console.log(local);
}

//getTime()

async function esed(data) {
    let status = {
        error: false,
        mode: process.env.MODE,
        from: '',
        date: new Date(),
        send: true,
        data: data        
    };
    let tmp;
    //console.log("==================ESED==================");
    let str = `<a href=\"${data.url}\">${data.title}</a>\n================\n<a href="tg://user?id=${data.from}">`;
    const info = await MDB.FindOne(process.env.MDB_ESED_DB, 'users', { "tg": data.from });
    tmp = (info != null) ? info.name : "Неизвестный пользователь";
    console.log(tmp, data.type, data.title);
    status.from = tmp;
    str += tmp + "</a> ";
    //Проверка типа сообщения
    if (data.type == 'visa' || data.type == 'sign') {
        str += ((data.type == 'visa') ? `<i>завизировал(а)` : `<i>подписал(а)`) + `</i>\n================\n<i>${data.status}</i>`;
        str += (data.comment != undefined) ? `\n================\n<i>Комментарий</i>: ${data.comment}` : '';
        let authors = data.author.split(',');
        for (var i = 0; i < authors.length; i++) {
            const item = await MDB.FindOne(process.env.MDB_ESED_DB, 'users', { name: authors[i] });
            status.send = (await TG.sendMessage((process.env.MODE == 'debug') ? "debug" : item.tg, str) != undefined) ? true : false;
        }
        MDB.InsertOne(process.env.MDB_ESED_DB, 'status', status);
    }
    else if (data.type == 'visa-send' || data.type == 'sign-send') {
        str += ((data.type == 'visa-send') ? `отправил(а) на <i>визу` : `отправил(а) на <i>подпись`) + `</i>\n================`;
        if (info == null || !info.super) {
            let authors = data.list.split(',');
            tmp = '', list = [];
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
                status.send = (await TG.sendMessage((process.env.MODE == 'debug') ? "debug" : list[i], str + tmp) != undefined) ? true : false;
            }
            MDB.InsertOne(process.env.MDB_ESED_DB, 'status', status);
        }
    }
    else {
        let reg = new RegExp(/.*ознакомлен.*/i);
        if (info == null || !info.super) { //Проверка на Марину
            str += `<i>ввел(а) отчет:</i>\n================\nСтатус: <i>${data.status}</i>\n\n`;
            const item = await MDB.FindOne(process.env.MDB_ESED_DB, 'users', { name: data.author });
            if (item != null) {
                if (item.super) {
                    status.send = (await TG.sendMessage((process.env.MODE == 'debug') ? "debug" : item.tg, (data.text != undefined) ? str += data.text : str += 'Введен пустой отчет!') != undefined) ? true : false;
                }
                else {
                    if (data.text != undefined && !reg.test(data.text.substring(0, 10).toLowerCase())) {
                        status.send = (await TG.sendMessage((process.env.MODE == 'debug') ? "debug" : item.tg, str += data.text) != undefined) ? true : false;
                    }
                }                
            }
            else {
                status.error = `Автора поручения нет в справочнике: ${data.author}`;
            }
            MDB.InsertOne(process.env.MDB_ESED_DB, 'status', status);
        }
    }
}