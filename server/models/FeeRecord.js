const mongoose = require('mongoose');

const feeRecordSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    studentId: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: String, required: true },
    status: { type: String, enum: ['PAID', 'UNPAID'], default: 'UNPAID' },
}, { timestamps: true });

module.exports = mongoose.model('FeeRecord', feeRecordSchema);
