const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Create Review
router.post('/', async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get All Reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Review by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedReview = await Review.findByIdAndDelete(id);
    if (!deletedReview) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete experience' });
  }
});

router.post('/:id/replies', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, message } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    review.replies.push({ username, message });
    await review.save();

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add reply' });
  }
});
router.delete('/:reviewId/replies/:replyId', async (req, res) => {
  try {
    const { reviewId, replyId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    review.replies = review.replies.filter(reply => reply._id.toString() !== replyId);
    await review.save();

    res.json({ message: 'Reply deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete reply' });
  }
});

module.exports = router;
