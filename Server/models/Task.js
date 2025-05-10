const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  assignee: {
    type: String,
    required: true,
  },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    required: true,
  },
  deadline: {
    type: Date,
  },
  expired: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Task', taskSchema);