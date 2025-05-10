const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Folder = require('../models/Folder');
const { v4: uuidv4 } = require('uuid');

// Get all folders
router.get('/folders', async (req, res) => {
  try {
    const folders = await Folder.find();
    res.json(folders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a folder
router.post('/folders', async (req, res) => {
  const folder = new Folder({
    name: req.body.name,
    createdBy: req.body.createdBy,
    shareLink: uuidv4(),
  });

  try {
    const newFolder = await folder.save();
    req.io.emit('folderUpdate', newFolder);
    res.status(201).json(newFolder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a folder
router.delete('/folders/:id', async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    await Task.deleteMany({ folder: req.params.id });
    await folder.deleteOne();
    req.io.emit('folderDelete', req.params.id);
    res.json({ message: 'Folder deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tasks for a specific folder
router.get('/tasks/folder/:folderId', async (req, res) => {
  try {
    const tasks = await Task.find({ folder: req.params.folderId });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a task
router.post('/tasks', async (req, res) => {
  const task = new Task({
    title: req.body.title,
    assignee: req.body.assignee,
    folder: req.body.folderId,
    deadline: req.body.deadline,
    expired: false,
  });

  try {
    const newTask = await task.save();
    req.io.emit('taskUpdate', newTask);

    if (newTask.deadline) {
      const now = new Date();
      const deadline = new Date(newTask.deadline);
      const timeUntilDeadline = deadline - now;

      if (timeUntilDeadline > 0) {
        setTimeout(() => {
          Task.findById(newTask._id).then((task) => {
            if (task && !task.expired) {
              task.expired = true;
              task.save().then(() => {
                req.io.emit('taskExpired', {
                  taskId: task._id,
                  title: task.title,
                  folderId: task.folder,
                  message: `Task "${task.title}" has expired!`,
                });
              });
            }
          });
        }, timeUntilDeadline);
      }
    }

    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a task
router.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    await task.deleteOne();
    req.io.emit('taskDelete', req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;