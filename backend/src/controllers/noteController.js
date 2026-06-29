const Note = require('../models/Note');

const getNotes = async (req, res) => {
  try {
    const { search, category, status, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10 } = req.query;

    const filter = { userId: req.user._id };
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) filter.$text = { $search: search };

    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { isPinned: -1, [sortBy]: sortOrder };

    const skip = (Number(page) - 1) * Number(limit);
    const [notes, total] = await Promise.all([
      Note.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Note.countDocuments(filter),
    ]);

    res.json({ notes, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createNote = async (req, res) => {
  try {
    const { title, content, category, tags, status, isPinned } = req.body;
    const note = await Note.create({ title, content, category, tags, status, isPinned, userId: req.user._id });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getNotes, getNoteById, createNote, updateNote, deleteNote };
