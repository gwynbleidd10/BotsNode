require('dotenv').config()

const MDB = require('./MongoDB')

async function aaa() {
    let res = await MDB.InsertOne(process.env.MDB_ESED_DB, 'status', {status: true, date: new Date()});
    //res = await MDB.Find(process.env.MDB_ESED_DB, 'status', {date: {$gte: new Date("2020-07-17")}})
    console.log(res.result.ok);
}

aaa();