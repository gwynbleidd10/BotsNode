const { Router } = require('express')
const Status = require('../models/Status')

const router = Router()

router.get('/status', async (req, res) => {
    console.log("Get")
    try {
        const result = await Status.find({ mode: 'prod' }).sort({ date: 'desc' })
        // res.forEach((item, i) => {
        //     console.log(item)
        // })
        //console.log(result)



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