const { Router } = require('express')
const router = Router()

const { esed } = require('../Functions')

const Status = require('../models/Status')

router.get('/version', async (req, res) => {
    res.json({ version: process.env.SCRIPT_VERSION });
})

router.post('/', function (req, res) {
    res.status(200).json({ 'status': 'OK' });
    esed(req.body);
});

router.get('/status', async (req, res) => {
    console.log("Get")
    try {
        const result = await Status.find({ mode: 'prod' }).sort({ date: 'desc' })
        res.json({
            columns: [
                {
                    label: 'Тип уведомления',
                    field: 'type'
                },
                {
                    label: 'ФИО',
                    field: 'from',
                },
                {
                    label: 'Дата',
                    field: 'date'
                }
            ],
            rows: result
        })
    } catch (e) {
        console.log(e.message)
        res.status(500).json({ message: '/status error' })
    }
})

router.post('/status', async (req, res) => {
    console.log("post")
})

module.exports = router