// server/routes/polls.js
const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');

// Create a poll
router.post('/', async (req, res) => {
  try {
    const { question, options } = req.body;
    console.log('Received POST data:', req.body); // Debugging log

    // Validate inputs
    if (!question || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'A question and at least two options are required.' });
    }

    // Ensure options are in correct format
    const formattedOptions = options.map(opt => {
      if (typeof opt === 'string') {
        return { text: opt, votes: 0 };
      } else if (typeof opt === 'object' && typeof opt.text === 'string') {
        return { text: opt.text, votes: opt.votes ?? 0 };
      } else {
        throw new Error('Each option must be a string or an object with a text field.');
      }
    });

    // Create and save the poll
    const poll = new Poll({ question, options: formattedOptions });
    await poll.save();
    res.status(201).json(poll);
  } catch (err) {
    console.error('Error creating poll:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Get all polls
router.get('/', async (req, res) => {
  try {
    const polls = await Poll.find();
    res.json(polls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vote on a poll option
router.post('/:id/vote', async (req, res) => {
  const { optionIndex } = req.body;

  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });

    if (
      typeof optionIndex !== 'number' ||
      optionIndex < 0 ||
      optionIndex >= poll.options.length
    ) {
      return res.status(400).json({ error: 'Invalid option index' });
    }

    poll.options[optionIndex].votes += 1;
    await poll.save();
    res.json(poll);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
