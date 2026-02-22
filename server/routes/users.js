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

// POST register — create a new student or teacher account
router.post('/register', async (req, res) => {
    try {
        const { name, role, ktuid, department, email, password } = req.body;

        // Validate required fields
        if (!name || !role || !ktuid || !department || !email || !password) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Validate role
        if (!['STUDENT', 'TEACHER'].includes(role)) {
            return res.status(400).json({ error: 'Role must be STUDENT or TEACHER.' });
        }

        // Check for duplicate KTU ID
        const existing = await User.findOne({ ktuid });
        if (existing) {
            return res.status(409).json({ error: 'KTU ID already registered.' });
        }

        const newUser = new User({
            id: ktuid,   // use ktuid as the stable user id
            name,
            role,
            ktuid,
            department,
            email,
            password,
        });

        const saved = await newUser.save();
        const { password: _, ...userWithoutPassword } = saved.toObject();
        res.status(201).json(userWithoutPassword);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
