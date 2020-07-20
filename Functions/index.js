module.exports = {
    esed: esed
}

const MDB = require('../MongoDB')    //Mongo DB module
const TG = require('../Telegram');    //Telegram module

console.log('===============Functions=init================');

async function esed(data) {
    (process.env.MODE == "debug") ? console.log(data) : '';
    let status = {
        send: '',
        mode: process.env.MODE,
        from: '',
        date: (new Date(Date.now() - (-32400000))),
        data: data
    };
    let list = [], arr = [], stat = [], authors, user;
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
        authors = data.author.split(',');
        tmp = [];
        for (let i = 0; i < authors.length; i++) {
            user = await MDB.FindOne(process.env.MDB_ESED_DB, 'users', { name: authors[i] });
            tmp.push(authors[i] + ": " + await check(data, user, str));
        }
        status.send = tmp;
        MDB.InsertOne(process.env.MDB_ESED_DB, 'status', status);
        (process.env.MODE == "debug") ? console.log(status) : '';
    }
    else if (data.type == 'visa-send' || data.type == 'sign-send') {
        //{title, url, type, list, from}
        if (info == null || !info.super) {  //Проверка на Марину
            str += ((data.type == 'visa-send') ? `отправил(а) на <i>визу` : `отправил(а) на <i>подпись`) + `</i>\n================`;
            authors = data.list.split(',');
            for (let i = 0; i < authors.length; i++) {
                user = await MDB.FindOne(process.env.MDB_ESED_DB, 'users', { name: authors[i] });
                if (user != null) {
                    tmp += '\n' + ((user.tg != '') ? `<a href="tg://user?id=${user.tg}">${authors[i]}</a>` : authors[i]);
                    list.push(user.tg);
                }
                else {
                    tmp += '\n' + authors[i];
                }
            }
            for (let i = 0; i < list.length; i++) {
                user = await MDB.FindOne(process.env.MDB_ESED_DB, 'users', { tg: list[i] });
                arr.push(user.name + ": " + await check(data, user, str + tmp));
            }
            status.send = (list.length > 0) ? arr : "Ни одного пользователя нет в справочнике";
            MDB.InsertOne(process.env.MDB_ESED_DB, 'status', status);
            (process.env.MODE == "debug") ? console.log(status) : '';
        }
    }
    else if (data.type == 'resolution') {
        //{title, url, type, list {title, list, [date]}, from}
        str += 'назначил(а) <i>поручение</i>\n================';
        for (let i = 0; i < data.list.length; i++) {
            if (data.list[i].control == "true") {
                tmp = '';
                tmp += '\nПоручение: <i>' + data.list[i].title + '</i>\n================\nСрок: <i>' + data.list[i].date + '</i>\n================';
                authors = data.list[i].list.split(',');
                list = [];
                for (let i = 0; i < authors.length; i++) {
                    user = await MDB.FindOne(process.env.MDB_ESED_DB, 'users', { name: (authors[i][0] == ('(')) ? authors[i].substr(7, authors[i].length - 7) : (authors[i][0] == ('+')) ? authors[i].substr(2, authors[i].length - 2) : authors[i] });
                    if (user != null) {
                        tmp += '\n' + ((user.tg != '') ? `<a href="tg://user?id=${user.tg}">${authors[i]}</a>` : authors[i]);
                        list.push(user.tg);
                    }
                    else {
                        tmp += '\n' + authors[i];
                    }
                }
                for (let i = 0; i < list.length; i++) {
                    user = await MDB.FindOne(process.env.MDB_ESED_DB, 'users', { tg: list[i] });
                    stat.push(user.name + ": " + await check(data, user, str + tmp));
                }
                arr.push(status.send = (list.length > 0) ? stat : "Ни одного пользователя нет в справочнике");
            }
            else {
                arr.push(["Неконтрольное поручение"]);
            }
        }
        status.send = arr;
        MDB.InsertOne(process.env.MDB_ESED_DB, 'status', status);
        (process.env.MODE == "debug") ? console.log(status) : '';
    }
    else {
        //{title, url, type, status, text, author, from}
        if (info == null || !info.super) { //Проверка на Марину
            str += `<i>ввел(а) отчет:</i>\n================\nСтатус: <i>${data.status}</i>\n================\n`;
            user = await MDB.FindOne(process.env.MDB_ESED_DB, 'users', { name: data.author });
            status.send = await check(data, user, str);
            MDB.InsertOne(process.env.MDB_ESED_DB, 'status', status);
            (process.env.MODE == "debug") ? console.log(status) : '';
        }
    }
    (process.env.MODE == "debug") ? console.log("ESED END") : '';
}

async function check(data, info, str) {
    (process.env.MODE == "debug") ? console.log("check") : '';
    let reg = new RegExp(/.*ознакомлен.*/i);
    if (info != null) {
        if (info.tg == '') {
            return 'У пользователя не задан Telegram ID';
        }
        if (data.type == 'answer') {
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
        else {
            return await TG.sendMessage((process.env.MODE == 'debug') ? "debug" : info.tg, str);
        }
    }
    else {
        return "Пользователя нет в справочнике";
    }
}