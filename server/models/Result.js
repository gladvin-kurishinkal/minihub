const mongoose = require('mongoose');

const subjectResultSchema = new mongoose.Schema({
    code: String,
    name: String,
    grade: String,
    credits: Number,
    gradePoint: Number,
}, { _id: false });

const resultSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    semester: { type: Number, required: true },
    sgpa: { type: Number, required: true },
    subjects: [subjectResultSchema],
}, { timestamps: true });

resultSchema.index({ studentId: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);
