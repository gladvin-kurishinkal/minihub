const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET all users (for login lookup - in real app you'd use JWT/sessions)
router.get('/', async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // exclude passwords
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST login
router.post('/login', async (req, res) => {
    try {
        const { ktuid, password } = req.body;
        const user = await User.findOne({ ktuid });
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const { password: _, ...userWithoutPassword } = user.toObject();
        res.json(userWithoutPassword);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
