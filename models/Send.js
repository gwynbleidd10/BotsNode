const { Schema, model } = require('mongoose')

const schema = new Schema({}, { versionKey: false, strict: false })

module.exports = model('Send', schema)