const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/:date', taskController.getTaskByDate);
router.get('/:id/test-case', taskController.fetchTestCaseForToday);
router.put('/:id/attempts', taskController.updateAttemptsTask);
router.put('/:id/solved', taskController.updateSolvedTask);

module.exports = router;