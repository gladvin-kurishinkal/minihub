const express = require('express');
const router = express.Router();
const FeeRecord = require('../models/FeeRecord');

// GET fees (optionally filter by studentId)
router.get('/', async (req, res) => {
    try {
        const filter = req.query.studentId ? { studentId: req.query.studentId } : {};
        const fees = await FeeRecord.find(filter);
        res.json(fees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create fee
router.post('/', async (req, res) => {
    try {
        const fee = new FeeRecord(req.body);
        await fee.save();
        res.status(201).json(fee);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PATCH update fee status
router.patch('/:id', async (req, res) => {
    try {
        const fee = await FeeRecord.findOneAndUpdate(
            { id: req.params.id },
            { $set: req.body },
            { new: true }
        );
        if (!fee) return res.status(404).json({ error: 'Not found' });
        res.json(fee);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE fee
router.delete('/:id', async (req, res) => {
    try {
        const fee = await FeeRecord.findOneAndDelete({ id: req.params.id });
        if (!fee) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
