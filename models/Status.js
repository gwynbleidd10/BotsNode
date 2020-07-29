const { Schema, model } = require('mongoose')

const schema = new Schema({
    type: { type: String },
    from: { type: String },
    dept: { type: String, default: '' },
    send: { type: Schema.Types.Mixed },
    date: { type: Date, default: (new Date(Date.now() - (-32400000))) },
    input: { type: Schema.Types.ObjectId, ref: 'Input' }
}, { versionKey: false })

module.exports = model('Status', schema)