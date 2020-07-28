const { Router } = require('express')
const router = Router()

const { esed } = require('../Functions')

const Status = require('../models/Status')
const User = require('../models/User')

router.get('/version', async (req, res) => {
    if (req.query.name) {
        const user = await User.findOne({ tg: req.query.tg })
        if (user) {
            if (!user.name) {
                await User.updateOne({ tg: req.query.tg }, { name: req.query.name })
            }
        }
    }
    res.json({ version: process.env.SCRIPT_VERSION })
})

router.post('/', function (req, res) {    
    res.status(200).json({ 'status': 'OK' });
    esed(req.body);
});

router.get('/status', async (req, res) => {
    try {
        const result = await Status.find({ mode: 'prod' }).sort({ date: 'desc' })
        const answer = await Status.count({ mode: 'prod', type: 'Отчёт' })
        const resolution = await Status.count({ mode: 'prod', type: 'Поручение' })
        const visa = await Status.count({ mode: 'prod', type: 'Виза' })
        const sign = await Status.count({ mode: 'prod', type: 'Подпись' })
        const visaSend = await Status.count({ mode: 'prod', type: 'Отправка на визу' })
        const signSend = await Status.count({ mode: 'prod', type: 'Отправка на подпись' })

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
            rows: result,
            stat: { answer: JSON.stringify(answer), resolution: JSON.stringify(resolution), visa: JSON.stringify(visa), sign: JSON.stringify(sign), visaSend: JSON.stringify(visaSend), signSend: JSON.stringify(signSend) }
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
