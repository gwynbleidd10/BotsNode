const { Schema, model } = require('mongoose')

const schema = new Schema({
    send: { type: Array },
    from: { type: String, required: true, unique: true },
    date: { type: Date },
    data: [{ type: Array }]
})

module.exports = model('status', schema)