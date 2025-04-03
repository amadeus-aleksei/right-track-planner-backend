const express = require('express');
const sql = require('../../config/db');
const authMiddleware = require('../../middleware/auth');

const router = express.Router();

// Get all habits for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const habits = await sql`
      SELECT id, name, completed, created_at
      FROM habits
      WHERE user_id = ${req.user.id}
    `;
    res.status(200).json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new habit
router.post('/', authMiddleware, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Habit name is required' });
  }

  try {
    const [newHabit] = await sql`
      INSERT INTO habits (user_id, name)
      VALUES (${req.user.id}, ${name})
      RETURNING id, name, completed, created_at
    `;
    res.status(201).json(newHabit);
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle habit completion status
router.patch('/:id/toggle', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const [habit] = await sql`
      SELECT * FROM habits
      WHERE id = ${id} AND user_id = ${req.user.id}
    `;
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const [updatedHabit] = await sql`
      UPDATE habits
      SET completed = ${!habit.completed}
      WHERE id = ${id}
      RETURNING id, name, completed, created_at
    `;
    res.status(200).json(updatedHabit);
  } catch (error) {
    console.error('Error toggling habit:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;