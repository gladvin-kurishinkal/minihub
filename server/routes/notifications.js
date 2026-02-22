const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// GET notifications (optionally filter by studentId)
router.get('/', async (req, res) => {
    try {
        const filter = req.query.studentId ? { studentId: req.query.studentId } : {};
        const notifs = await Notification.find(filter).sort({ createdAt: -1 });
        res.json(notifs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create notification
router.post('/', async (req, res) => {
    try {
        const notif = new Notification(req.body);
        await notif.save();
        res.status(201).json(notif);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PATCH mark as read
router.patch('/:id', async (req, res) => {
    try {
        const notif = await Notification.findOneAndUpdate(
            { id: req.params.id },
            { $set: req.body },
            { new: true }
        );
        if (!notif) return res.status(404).json({ error: 'Not found' });
        res.json(notif);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
