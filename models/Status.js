const { Schema, model } = require('mongoose')

const schema = new Schema({
    type: { type: String },
    user: { type: String, required: true, unique: true },
    date: { type: Date, default: (new Date(Date.now() - (-32400000))) },
    test: { type: Schema.Types.ObjectId, ref: 'users' },
    data: { type: Schema.Types.ObjectId, ref: 'data' }
}, { versionKey: false })

module.exports = model('status', schema)