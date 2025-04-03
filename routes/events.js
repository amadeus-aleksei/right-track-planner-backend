const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// Get all events for user
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user.id });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error });
  }
});

// Create new event
router.post('/', async (req, res) => {
  try {
    const event = new Event({
      title: req.body.title,
      date: req.body.date,
      userId: req.user.id
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: 'Error creating event', error });
  }
});

module.exports = router;