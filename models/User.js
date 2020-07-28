const { Schema, model } = require('mongoose')

const schema = new Schema({
    name: { type: String, default: '' },
    tg: { type: String, unique: true },
    dept: { type: String, default: null },
    super: { type: Boolean, default: false }
}, { versionKey: false })

module.exports = model('User', schema)
