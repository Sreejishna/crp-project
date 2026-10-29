const SkillRoadmap = require('../models/SkillRoadmap');

// @desc    Get all skill roadmaps and interview preparation guides
// @route   GET /api/roadmaps
// @access  Public / Authenticated
const getRoadmaps = async (req, res, next) => {
  try {
    const { category, season, quarter, difficulty } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (season && season !== 'All') {
      query.targetSeason = { $regex: season, $options: 'i' };
    }

    if (quarter && quarter !== 'All') {
      query.$or = [{ targetSeasonKey: quarter }, { targetSeasonKey: 'All' }];
    }

    if (difficulty && difficulty !== 'All') {
      query.difficultyLevel = difficulty;
    }

    const roadmaps = await SkillRoadmap.find(query).sort({ targetSeasonKey: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: roadmaps.length,
      data: roadmaps,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single roadmap details with topics and interview questions
// @route   GET /api/roadmaps/:id
// @access  Public / Authenticated
const getRoadmapById = async (req, res, next) => {
  try {
    const roadmap = await SkillRoadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Skill Roadmap not found' });
    }

    return res.status(200).json({
      success: true,
      data: roadmap,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new skill roadmap / prep module (Admin)
// @route   POST /api/roadmaps
// @access  Private (Admin)
const createRoadmap = async (req, res, next) => {
  try {
    const roadmap = await SkillRoadmap.create(req.body);

    return res.status(201).json({
      success: true,
      message: 'Skill roadmap created successfully!',
      data: roadmap,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update roadmap (Admin)
// @route   PUT /api/roadmaps/:id
// @access  Private (Admin)
const updateRoadmap = async (req, res, next) => {
  try {
    let roadmap = await SkillRoadmap.findById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }

    roadmap = await SkillRoadmap.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Roadmap updated successfully!',
      data: roadmap,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete roadmap (Admin)
// @route   DELETE /api/roadmaps/:id
// @access  Private (Admin)
const deleteRoadmap = async (req, res, next) => {
  try {
    const roadmap = await SkillRoadmap.findById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }

    await roadmap.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Roadmap deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoadmaps,
  getRoadmapById,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
};
