const { Schema, model } = require('mongoose')

const schema = new Schema({
    type: { type: String },    
    from: { type: String },
    date: { type: Date, default: (new Date(Date.now() - (-32400000))) },
    send: { type: Schema.Types.Mixed, default: 'UNUSED' },
    input: { type: Schema.Types.ObjectId, ref: 'Input' }
}, { versionKey: false })

module.exports = model('Statistic', schema)