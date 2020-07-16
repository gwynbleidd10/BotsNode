require('dotenv').config()

const MDB = require('./MongoDB')
const TG = require('./Telegram')

async function aaa() {

    //MDB.InsertOne(process.env.MDB_ESED_DB, 'status', { status: true, date: new Date() });

    //res = await MDB.Find(process.env.MDB_ESED_DB, 'status', {date: {$gte: new Date("2020-07-17")}})

    let s = 'asd';
    s = undefined ?? s;
    console.log(s)
}

aaa();