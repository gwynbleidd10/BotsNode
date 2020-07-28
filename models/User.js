const { Schema, model } = require('mongoose')

const schema = new Schema({
    super: { type: Boolean, default: false },
    tg: { type: String, unique: true },
    name: { type: String, default: null },
    dept: { type: String, default: null }
})

module.exports = model('User', schema)
