const express = require('express');
const router = express.Router();
const List = require('../models/List');

// Get all lists for user
router.get('/', async (req, res) => {
  try {
    const lists = await List.find({ userId: req.user.id });
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lists', error });
  }
});

// Create new list
router.post('/', async (req, res) => {
  try {
    const list = new List({
      name: req.body.name,
      userId: req.user.id,
      tasks: []
    });
    await list.save();
    res.status(201).json(list);
  } catch (error) {
    res.status(400).json({ message: 'Error creating list', error });
  }
});

// Add task to list
router.post('/:id/tasks', async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list || list.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    const newTask = {
      name: req.body.name,
      completed: false,
      createdAt: new Date()
    };
    
    list.tasks.push(newTask);
    await list.save();
    
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: 'Error adding task', error });
  }
});

module.exports = router;