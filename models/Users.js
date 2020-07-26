const { Schema, model } = require('mongoose')

const schema = new Schema({
    super: { type: Boolean },
    tg: { type: String, unique: true },
    name: { type: String, required: true }
})

module.exports = model('users', schema)