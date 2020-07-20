module.exports = {
    Find: Find,
    FindOne: FindOne,
    InsertOne: InsertOne
}

console.log('=================MongoDB=init================');

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://" + process.env.MDB_USER + ":" + process.env.MDB_PASS + "@" + process.env.MDB_CLUSTER + "/";

async function FindOne(db, coll, filter) {
    //console.log("===============MDB.FindOne==============");
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).catch((e) => { console.error(e) });
    const collection = client.db(db).collection(coll);
    const result = await collection.findOne(filter);
    client.close();
    return result;
}
async function Find(db, coll, filter) {
    //console.log("================MDB.Find================");
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const collection = client.db(db).collection(coll);
    const result = await collection.find(filter).toArray();
    client.close();
    return result;
}
async function InsertOne(db, coll, data) {
    //console.log("==============MDB.InsertOne=============");
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const collection = client.db(db).collection(coll);
    const result = await collection.insertOne(data);
    client.close();
    return result;
}