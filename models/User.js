const { Schema, model } = require('mongoose')

const schema = new Schema({
    super: { type: Boolean, default: false },
    tg: { type: String, unique: true },
    name: { type: String, default: '' },
    dept: { type: String, default: null }
}, { versionKey: false })

module.exports = model('users', schema)
