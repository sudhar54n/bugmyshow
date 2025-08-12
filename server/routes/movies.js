import express from 'express';
import Movie from '../models/Movie.js';

const router = express.Router();

// --- Utility ---------------------------------------------------------------

/**
 * Normalize any value into an array suitable for `reviews`.
 * Handles: undefined/null, stringified JSON, wrong types.
 */
function normalizeReviews(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  // If it's some other object/number/etc, reset to empty array.
  return [];
}

/**
 * Basic input sanitizer/formatter for reviews
 */
function buildReview({ user, comment, rating }) {
  return {
    user: String(user || 'Anonymous'),
    comment: String(comment || '').trim(),
    rating: Number.isFinite(Number(rating)) ? Number(rating) : 0,
    date: new Date()
  };
}

// --- Routes ----------------------------------------------------------------

// GET /api/movies
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find({});
    res.json(movies);
  } catch (err) {
    console.error('Error listing movies:', err);
    res.status(500).json({ error: 'Failed to list movies' });
  }
});

// GET /api/movies/:id
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  } catch (err) {
    console.error('Error fetching movie:', err);
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
});

// POST /api/movies
// (Optional create endpoint; keep or remove as your app requires)
router.post('/', async (req, res) => {
  try {
    const payload = req.body || {};
    const movie = new Movie(payload);
    // Ensure reviews is always an array on new docs too
    movie.reviews = normalizeReviews(movie.reviews);
    await movie.save();
    res.status(201).json(movie);
  } catch (err) {
    console.error('Error creating movie:', err);
    res.status(500).json({ error: 'Failed to create movie' });
  }
});

// PUT /api/movies/:id
// (Optional update endpoint)
router.put('/:id', async (req, res) => {
  try {
    const payload = { ...req.body };
    // If caller sends reviews, normalize it so we don't store bad shapes
    if ('reviews' in payload) payload.reviews = normalizeReviews(payload.reviews);

    const movie = await Movie.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  } catch (err) {
    console.error('Error updating movie:', err);
    res.status(500).json({ error: 'Failed to update movie' });
  }
});

// DELETE /api/movies/:id
// (Optional delete endpoint)
router.delete('/:id', async (req, res) => {
  try {
    const out = await Movie.findByIdAndDelete(req.params.id);
    if (!out) return res.status(404).json({ error: 'Movie not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('Error deleting movie:', err);
    res.status(500).json({ error: 'Failed to delete movie' });
  }
});

// POST /api/movies/:id/reviews
// Adds a review safely even if reviews was null/string/incorrect type.
router.post('/:id/review', async (req, res) => {
  try {
    // Validate input data
    const { user, comment, rating } = req.body;
    
    // Check comment length (max 1000 characters)
    if (comment && comment.length > 1000) {
      return res.status(400).json({ 
        error: 'Review comment cannot exceed 1000 characters' 
      });
    }
    
    // Validate rating range
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }

    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });

    // Normalize reviews BEFORE push (this fixes your crash)
    movie.reviews = normalizeReviews(movie.reviews);

    const review = buildReview({
      user: user || 'Anonymous',
      comment: comment || '',
      rating: rating || 5
    });
    movie.reviews.push(review);

    await movie.save();
    res.status(201).json({
      message: 'Review added',
      reviews: movie.reviews
    });
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ error: 'Failed to add review' });
  }
});
