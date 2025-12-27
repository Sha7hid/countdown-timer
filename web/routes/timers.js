const express = require('express');
const router = express.Router();
const Timer = require('../models/Timer');

// Apply auth middleware to all routes


// GET all timers for the authenticated store
router.get('/', async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const timers = await Timer.find({ shop: session.shop })
      .sort({ createdAt: -1 });

    res.json({ timers });
  } catch (error) {
    console.error('Error fetching timers:', error);
    res.status(500).json({ error: 'Failed to fetch timers' });
  }
});

// GET single timer
router.get('/:id', async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const timer = await Timer.findOne({
      _id: req.params.id,
      shop: session.shop
    });

    if (!timer) {
      return res.status(404).json({ error: 'Timer not found' });
    }

    res.json({ timer });
  } catch (error) {
    console.error('Error fetching timer:', error);
    res.status(500).json({ error: 'Failed to fetch timer' });
  }
});

// CREATE new timer
router.post('/', async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const timerData = {
      ...req.body,
      shop: session.shop
    };

    // Validate dates
    const startDate = new Date(timerData.startDate);
    const endDate = new Date(timerData.endDate);

    if (endDate <= startDate) {
      return res.status(400).json({
        error: 'End date must be after start date'
      });
    }

    const timer = new Timer(timerData);
    await timer.save();

    res.status(201).json({ timer });
  } catch (error) {
    console.error('Error creating timer:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    res.status(500).json({ error: 'Failed to create timer' });
  }
});

// UPDATE timer
router.put('/:id', async (req, res) => {
  try {
    const session = res.locals.shopify.session;

    // Validate dates if present in body
    if (req.body.startDate && req.body.endDate) {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);

      if (endDate <= startDate) {
        return res.status(400).json({
          error: 'End date must be after start date'
        });
      }
    }

    const timer = await Timer.findOneAndUpdate(
      { _id: req.params.id, shop: session.shop },
      req.body,
      { new: true, runValidators: true }
    );

    if (!timer) {
      return res.status(404).json({ error: 'Timer not found' });
    }

    res.json({ timer });
  } catch (error) {
    console.error('Error updating timer:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    res.status(500).json({ error: 'Failed to update timer' });
  }
});

// DELETE timer
router.delete('/:id', async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const timer = await Timer.findOneAndDelete({
      _id: req.params.id,
      shop: session.shop
    });

    if (!timer) {
      return res.status(404).json({ error: 'Timer not found' });
    }

    res.json({ message: 'Timer deleted successfully' });
  } catch (error) {
    console.error('Error deleting timer:', error);
    res.status(500).json({ error: 'Failed to delete timer' });
  }
});

// TOGGLE timer active status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const timer = await Timer.findOne({
      _id: req.params.id,
      shop: session.shop
    });

    if (!timer) {
      return res.status(404).json({ error: 'Timer not found' });
    }

    timer.isActive = !timer.isActive;
    await timer.save();

    res.json({ timer });
  } catch (error) {
    console.error('Error toggling timer:', error);
    res.status(500).json({ error: 'Failed to toggle timer' });
  }
});

module.exports = router;