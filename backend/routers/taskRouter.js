const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

router.get("/:date", taskController.getTaskByDate);
router.get("/:id/test-case", taskController.fetchTestCaseForToday);
router.get("/test-cases/:testCaseId", taskController.getSpecificTestCaseById);
router.put(
  "/users/:userId/daily-test-case-id",
  taskController.updateUserDailyChallengeId
);

router.post("/:id/evaluate", taskController.evaluateTask);

module.exports = router;
