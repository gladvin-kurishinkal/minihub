const express = require('express');
const router = express.Router();
const Result = require('../models/Result');

// GET results (optionally filter by studentId)
router.get('/', async (req, res) => {
    try {
        const filter = req.query.studentId ? { studentId: req.query.studentId } : {};
        const results = await Result.find(filter).sort({ semester: 1 });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH update a specific semester result
router.patch('/:studentId/:semester', async (req, res) => {
    try {
        const result = await Result.findOneAndUpdate(
            { studentId: req.params.studentId, semester: parseInt(req.params.semester) },
            { $set: req.body },
            { new: true, upsert: true }
        );
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
