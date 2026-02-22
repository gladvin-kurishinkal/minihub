const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    studentId: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['FEE', 'ACADEMIC', 'GENERAL'], default: 'GENERAL' },
    timestamp: { type: String },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
