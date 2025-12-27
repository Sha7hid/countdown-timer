const express = require('express');
const router = express.Router();
const Timer = require('../models/Timer');

// GET active timers for a shop (public endpoint for widget)
router.get('/timers/active', async (req, res) => {
  try {
    const { shop, product_id } = req.query;

    if (!shop) {
      return res.status(400).json({ error: 'Shop parameter required' });
    }

    console.log(`[Public API] Fetching timers for shop: ${shop}, product: ${product_id}`);

    const now = new Date();
    console.log(`[Public API] Current server time: ${now.toISOString()}`);

    // Build query
    const query = {
      shop: shop,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    };

    // If product_id is provided, filter by product
    if (product_id) {
      query.$or = [
        { targetProducts: 'all' },
        { targetProducts: 'specific', productIds: product_id }
      ];
    } else {
      query.targetProducts = 'all';
    }

    const timers = await Timer.find(query)
      .select('-shop -views -clicks -__v')
      .sort({ createdAt: -1 })
      .limit(1); // Only return the most recent active timer

    console.log(`[Public API] Query:`, JSON.stringify(query));
    console.log(`[Public API] Found ${timers.length} timers`);

    if (timers.length > 0) {
      console.log(`[Public API] Returning timer: ${timers[0].title} (Ends: ${timers[0].endDate})`);
    } else {
      console.log(`[Public API] No matching active timers found.`);
    }

    // If timer found, increment view count
    if (timers.length > 0) {
      await Timer.updateOne(
        { _id: timers[0]._id },
        { $inc: { views: 1 } }
      );
    }

    res.json({
      timer: timers[0] || null,
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error('Error fetching active timers:', error);
    res.status(500).json({ error: 'Failed to fetch active timers' });
  }
});

// Track timer click (when user interacts with timer)
router.post('/timers/:id/click', async (req, res) => {
  try {
    const { id } = req.params;

    await Timer.updateOne(
      { _id: id },
      { $inc: { clicks: 1 } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ error: 'Failed to track click' });
  }
});

module.exports = router;