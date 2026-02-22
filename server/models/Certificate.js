const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    studentDepartment: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: String, required: true },
    pointsClaimed: { type: Number, required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    fileUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
