const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/task/:date', taskController.getTaskByDate);
router.put('/task/:id', taskController.updateAttemptsTask);
router.put('/task/:id', taskController.updateSolvedTask);