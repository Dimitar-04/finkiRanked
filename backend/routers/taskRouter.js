const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/:date', taskController.getTaskByDate);
router.get('/:id/test-case', taskController.fetchTestCaseForToday);

router.post('/:id/evaluate', taskController.evaluateTask);

module.exports = router;
