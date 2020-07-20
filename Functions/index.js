module.exports = {
    esed: esed
}

const MDB = require('../MongoDB')    //Mongo DB module
const TG = require('../Telegram');    //Telegram module

console.log('===============Functions=init================');

function getTime() {
    let local = new Date().format("yyyy-MM-ddThh:mm:ss");
    console.log(local);
}

//getTime()

async function esed(data) {
    //debug
    //(process.env.MODE == "debug") ? console.log(data) : '';
    let status = {
        send: '',
        mode: process.env.MODE,
        from: '',
        date: new Date(),
        data: data
    };
    let list = '';
    let str = `<a href=\"${data.url}\">${data.title}</a>\n================\n<a href="tg://user?id=${data.from}">`;
    const info = await MDB.FindOne(process.env.MDB_ESED_DB, 'users', { "tg": data.from });
    //debug
    //(process.env.MODE == "debug") ? (info != null) ? console.log(info) : "Неизвестный пользователь" : '';
    let tmp = (info != null) ? info.name : "Неизвестный пользователь";
    console.log(tmp, data.type, data.title);
    status.from = tmp;
    str += tmp + "</a> ";
    //Проверка типа сообщения
    if (data.type == 'visa' || data.type == 'sign') {
        //{title, url, author, type, status, [comment], from}
        str += ((data.type == 'visa') ? `<i>завизировал(а)` : `<i>подписал(а)`) + `</i>\n================\n<i>${data.status}</i>`;
        str += (data.comment != undefined) ? `\n================\n<i>Комментарий</i>: ${data.comment}` : '';
        let authors = data.author.split(',');
        tmp = [];
        for (var i = 0; i < authors.length; i++) {
            const user = await MDB.FindOne(process.env.MDB_ESED_DB, 'users', { name: authors[i] });
            tmp.push(author[i] + ": " + await checkAlerts(data, user, str));
        }
        status.send = tmp;
        //debug
        (process.env.MODE == "debug") ? console.log(status) : '';
        MDB.InsertOne(process.env.MDB_ESED_DB, 'status', status);
    }
    else if (data.type == 'visa-send' || data.type == 'sign-send') {
        //{title, url, type, list, from}
        str += ((data.type == 'visa-send') ? `отправил(а) на <i>визу` : `отправил(а) на <i>подпись`) + `</i>\n================`;
        if (info == null || !info.super) {
            let authors = data.list.split(',');
            tmp = '', list = [];
            for (let i = 0; i < authors.length; i++) {
                const item = await MDB.FindOne(process.env.MDB_ESED_DB, 'users', { name: authors[i] });
                if (item != null) {
                    tmp += `\n<a href="tg://user?id=${item.tg}">${item.name}</a>`;
                    list.push(item.tg);
                }
                else {
                    tmp += '\n' + authors[i];
                }
            }
            if (list.length != 0) {
                for (let i = 0; i < list.length; i++) {
                    status.send = (await TG.sendMessage((process.env.MODE == 'debug') ? "debug" : list[i], str + tmp) != undefined) ? true : false;
                }
            }
            else {
                status.error = `Авторов нет в справочнике: ${data.list}`;
            }
            //debug
            (process.env.MODE == "debug") ? console.log(status) : '';
            MDB.InsertOne(process.env.MDB_ESED_DB, 'status', status);
        }
    }
    else if (data.type == 'resolution') {
        //{title, url, type, list {title, list, [date]}, from}
        let arr = [];
        str += 'назначил(а) <i>поручение</i>\n================';
        for (let i = 0; i < data.list.length; i++) {
            let stat = [];
            tmp = '';
            tmp += '\n<i>' + data.list[i].title + '</i>\n================';
            let authors = data.list[i].list.split(',');
            list = [];
            let user;
            for (let i = 0; i < authors.length; i++) {
                user = await MDB.FindOne(process.env.MDB_ESED_DB, 'users', { name: (authors[i][0] == ('(')) ? authors[i].substr(7, authors[i].length - 7) : (authors[i][0] == ('+')) ? authors[i].substr(2, authors[i].length - 2) : authors[i] });
                if (user != null) {
                    if (user.tg != '') {
                        tmp += '\n' + `<a href="tg://user?id=${user.tg}">${authors[i]}</a>`;
                    }
                    else {
                        tmp += '\n' + authors[i];
                    }
                    list.push(user.tg);
                }
                else {
                    tmp += '\n' + authors[i];
                }
            }
            for (let i = 0; i < list.length; i++) {
                user = await MDB.FindOne(process.env.MDB_ESED_DB, 'users', { tg: list[i] });
                stat.push((user != null) ? user.name : + ": " + await checkAlerts(data, user, str + tmp));
            }
            arr.push(stat);
        }
        status.send = arr;
        //debug
        (process.env.MODE == "debug") ? console.log(status) : '';
        MDB.InsertOne(process.env.MDB_ESED_DB, 'status', status);
    }
    else {
        //{title, url, type, status, text, author, from}
        if (info == null || !info.super) { //Проверка на Марину
            str += `<i>ввел(а) отчет:</i>\n================\nСтатус: <i>${data.status}</i>\n================\n`;
            const user = await MDB.FindOne(process.env.MDB_ESED_DB, 'users', { name: data.author });
            status.send = data.author + ": " + await checkAlerts(data, user, str);
            //debug
            (process.env.MODE == "debug") ? console.log(status) : '';
            MDB.InsertOne(process.env.MDB_ESED_DB, 'status', status);
        }
    }
}

async function checkAlerts(data, info, str) {
    (process.env.MODE == "debug") ? console.log("checkAlerts") : '';
    if (info != null) {
        if (info.tg == '') {
            return 'У пользователя не задан Telegram ID';
        }
        switch (info.alerts) {
            case "none":
                return "У пользователя выключены оповещения";
            case "control":
                if (data.control != undefined && !data.control) {
                    return "У пользователя другие настройки оповещений";
                }
            default:
                return await checkType(data, info, str);
        }
    }
    else {
        return "Пользователя нет в справочнике";
    }
}

async function checkType(data, info, str) {
    (process.env.MODE == "debug") ? console.log("checkType") : '';
    let reg = new RegExp(/.*ознакомлен.*/i);
    if (data.type == 'visa' || data.type == 'sign') {
        return await TG.sendMessage((process.env.MODE == 'debug') ? "debug" : info.tg, str);
    }
    else if (data.type == 'visa-send' || data.type == 'sign-send') {

    }
    else if (data.type == 'resolution') {
        return await TG.sendMessage((process.env.MODE == 'debug') ? "debug" : info.tg, str);
    }
    else {
        if (info.super) {
            return await TG.sendMessage((process.env.MODE == 'debug') ? "debug" : info.tg, (data.text != undefined) ? str += data.text : str += 'Введен пустой отчет!');
        }
        else {
            if (data.text != undefined && !reg.test(data.text.substring(0, 10).toLowerCase())) {
                return await TG.sendMessage((process.env.MODE == 'debug') ? "debug" : info.tg, str += data.text);
            }
            else {
                return "Ознакомление";
            }
        }
    }
}