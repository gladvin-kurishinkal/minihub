const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');

// GET all certificates (optionally filter by studentId)
router.get('/', async (req, res) => {
    try {
        const filter = req.query.studentId ? { studentId: req.query.studentId } : {};
        const certs = await Certificate.find(filter).sort({ createdAt: -1 });
        res.json(certs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create certificate
router.post('/', async (req, res) => {
    try {
        const cert = new Certificate(req.body);
        await cert.save();
        res.status(201).json(cert);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PATCH update certificate status
router.patch('/:id', async (req, res) => {
    try {
        const cert = await Certificate.findOneAndUpdate(
            { id: req.params.id },
            { $set: req.body },
            { new: true }
        );
        if (!cert) return res.status(404).json({ error: 'Not found' });
        res.json(cert);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
