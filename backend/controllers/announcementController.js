const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public / Authenticated
const getAnnouncements = async (req, res, next) => {
  try {
    const { category, priority, audience, department } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (audience && audience !== 'All') {
      query.targetAudience = { $in: [audience, 'All Students'] };
    }

    if (department && department !== 'All') {
      query.$or = [{ department }, { department: null }];
    }

    const announcements = await Announcement.find(query)
      .populate('department', 'name code')
      .populate('relatedDrive', 'driveTitle hiringSeason')
      .sort({ isPinned: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create announcement (Admin / Department)
// @route   POST /api/announcements
// @access  Private (Admin, Department)
const createAnnouncement = async (req, res, next) => {
  try {
    const {
      title,
      content,
      category,
      priority,
      targetAudience,
      departmentId,
      relatedDriveId,
      isPinned,
    } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      category: category || 'Seasonal Drive Alert',
      priority: priority || 'Normal',
      targetAudience: targetAudience || 'All Students',
      postedByRole: req.user.role,
      postedByName: req.user.name + (req.user.role === 'department' ? ' (Department Coordinator)' : ' (Placement Cell)'),
      department: req.user.role === 'department' ? req.user.department : departmentId || null,
      relatedDrive: relatedDriveId || null,
      isPinned: isPinned || false,
    });

    return res.status(201).json({
      success: true,
      message: 'Announcement published successfully!',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update announcement (Admin / Department)
// @route   PUT /api/announcements/:id
// @access  Private (Admin, Department)
const updateAnnouncement = async (req, res, next) => {
  try {
    let announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Announcement updated successfully!',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement (Admin / Department)
// @route   DELETE /api/announcements/:id
// @access  Private (Admin, Department)
const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    await announcement.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
