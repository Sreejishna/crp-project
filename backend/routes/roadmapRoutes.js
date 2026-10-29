const express = require('express');
const router = express.Router();
const {
  getRoadmaps,
  getRoadmapById,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
} = require('../controllers/roadmapController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getRoadmaps);
router.get('/:id', getRoadmapById);
router.post('/', protect, authorize('admin'), createRoadmap);
router.put('/:id', protect, authorize('admin'), updateRoadmap);
router.delete('/:id', protect, authorize('admin'), deleteRoadmap);

module.exports = router;
