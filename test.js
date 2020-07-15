require('dotenv').config()

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

async function aaa() {
    let res = await MDBInsertOne(process.env.MDB_ESED_DB, 'status', {status: true, date: new Date()});
    res = await MDBFind(process.env.MDB_ESED_DB, 'status', {date: {$gte: new Date("2020-07-17")}})
    console.log(res);
}

aaa();