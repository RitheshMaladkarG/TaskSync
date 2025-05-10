const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  shareLink: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Folder', folderSchema);
