const express = require('express');
const router = express.Router();
const List = require('../models/List');
const Item = require('../models/Item');
const auth = require('../middleware/auth'); // Assuming you have auth middleware

// Get all lists for authenticated user
router.get('/lists', auth, async (req, res) => {
  try {
    const lists = await List.find({ userId: req.user.id });
    res.json(lists);
  }
  catch (error) {
    res.status(500).json({ message: 'Server error fetching lists' });
  }
});

// Create a new list
router.post('/lists', auth, async (req, res) => {
  try {
    const list = new List({
      name: req.body.name,
      userId: req.user.id,
      items: []
    });
    await list.save();
    res.status(201).json(list);
  } catch (error) {
    res.status(400).json({ message: 'Error creating list', error: error.message });
  }
});

// Add item to a list
router.post('/lists/:listId/items', auth, async (req, res) => {
  try {
    const list = await List.findOne({ _id: req.params.listId, userId: req.user.id });
    if (!list) return res.status(404).json({ message: 'List not found' });

    const newItem = {
      name: req.body.name,
      completed: false,
      createdAt: new Date()
    };
    list.items.push(newItem);
    await list.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: 'Error adding item', error: error.message });
  }
});

// Update item completion status
router.put('/lists/:listId/items/:itemId', auth, async (req, res) => {
  try {
    const list = await List.findOne({ _id: req.params.listId, userId: req.user.id });
    if (!list) return res.status(404).json({ message: 'List not found' });

    const item = list.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.completed = req.body.completed;
    await list.save();
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: 'Error updating item', error: error.message });
  }
});

module.exports = router;