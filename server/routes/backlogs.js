const express = require('express');
const router = express.Router();
const Backlog = require('../models/Backlog');

// GET backlogs (optionally filter by studentId)
router.get('/', async (req, res) => {
    try {
        const filter = req.query.studentId ? { studentId: req.query.studentId } : {};
        const backlogs = await Backlog.find(filter);
        res.json(backlogs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create backlog
router.post('/', async (req, res) => {
    try {
        const backlog = new Backlog(req.body);
        await backlog.save();
        res.status(201).json(backlog);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PATCH update backlog (status, etc.)
router.patch('/:id', async (req, res) => {
    try {
        const backlog = await Backlog.findOneAndUpdate(
            { id: req.params.id },
            { $set: req.body },
            { new: true }
        );
        if (!backlog) return res.status(404).json({ error: 'Not found' });
        res.json(backlog);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE backlog
router.delete('/:id', async (req, res) => {
    try {
        const backlog = await Backlog.findOneAndDelete({ id: req.params.id });
        if (!backlog) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
