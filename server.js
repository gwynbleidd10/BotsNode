/*
------------------------------------------------------------------------------------------------------
------------------------------------------------Init--------------------------------------------------
------------------------------------------------------------------------------------------------------
*/

require('dotenv').config()    //.env
const MDB = require('./MongoDB')    //Mongo DB module
const TG = require('./Telegram')    //Telegram module
const FC = require('./Functions')    //Functions module
console.log((new Date(Date.now() - (-32400000))));

/*
------------------------------------------------------------------------------------------------------
----------------------------------------------Express-------------------------------------------------
------------------------------------------------------------------------------------------------------
*/

const express = require('express')
const server = express()
const cors = require('cors')

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.listen(process.env.PORT, function () {
    console.log(`Express port: ${process.env.PORT}\nMode: ${process.env.MODE}\n`);
});

/*
*   API
*/

server.get('/', function (req, res) {
    res.send('Точка интеграции ботов.');
});

server.get('/ping', function (req, res) {
    res.status(200).json({ status: "OK" });
});

//  ESED

server.get('/api/esed/version', function (req, res) {
    res.json({ version: process.env.SCRIPT_VERSION });
});

server.post('/api/esed', function (req, res) {
    res.status(200).json({ 'status': 'OK' });
    FC.esed(req.body);
});