const mongoose = require('mongoose');

const backlogSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    studentId: { type: String, required: true },
    subjectCode: { type: String, required: true },
    subjectName: { type: String, required: true },
    semester: { type: Number, required: true },
    status: { type: String, enum: ['PENDING', 'REGISTERED', 'CLEARED'], default: 'PENDING' },
}, { timestamps: true });

module.exports = mongoose.model('Backlog', backlogSchema);
