// routes/assistant.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// POST a new message
router.post('/', async (req, res) => {
    console.log('Incoming request body:', req.body); // Log incoming request body
    try {
        const { role, content } = req.body;
        if (!content) {
            return res.status(400).json({ error: req.body });
        }
        const newMessage = new Message({ role, content });
        await newMessage.save();
        console.log('Message saved:', newMessage); // Log the saved message
        res.status(201).json({ threadId: newMessage._id, messages: [newMessage] });
        console.log('Response sent:', { threadId: newMessage._id, messages: [newMessage] }); // Log the response sent
    } catch (err) {
        console.error('Error saving message:', err); // Log any errors
        res.status(500).json({ error: 'Server error' });
        console.error('Error response sent:', { error: 'Server error' }); // Log the error response sent
    }
});

module.exports = router;
