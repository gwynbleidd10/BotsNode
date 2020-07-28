/*
------------------------------------------------------------------------------------------------------
------------------------------------------------Init--------------------------------------------------
------------------------------------------------------------------------------------------------------
*/

require('dotenv').config()    
const mongoose = require('mongoose')

/*
------------------------------------------------------------------------------------------------------
----------------------------------------------Express-------------------------------------------------
------------------------------------------------------------------------------------------------------
*/

const express = require('express')
const server = express()

server.use(require('cors')({ origin: '*' }))
server.use(express.json())
server.use(express.urlencoded({ extended: true }))

server.use('/api/esed', require('./routes/esed.routes'))

async function init() {
    try {
        await mongoose.connect("mongodb+srv://" + process.env.MDB_USER + ":" + process.env.MDB_PASS + "@" + process.env.MDB_CLUSTER + "/" + process.env.MDB_ESED_DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
        server.listen(process.env.PORT, () => console.log(`Express port: ${process.env.PORT}\nMode: ${(process.env.NODE_ENV) ? 'prod' : 'debug'}`))
    } catch (e) {
        console.error('Init error:', e.message)
    }
}

init()

/*
*   API
*/

server.get('/', function (req, res) {
    res.send('Точка интеграции ботов.')
})

server.get('/ping', function (req, res) {
    res.status(200).json({ status: "OK" })
})