const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

router.get("/all", taskController.getAllTasks);
router.get("/", taskController.getTaskByDate);
router.get("/:id/test-case", taskController.fetchTestCaseForToday);
router.get("/:id/test-cases", taskController.getAllTestCasesForTask);
router.get("/test-cases/:testCaseId", taskController.getSpecificTestCaseById);
router.put(
  "/users/:userId/daily-test-case-id",
  taskController.updateUserDailyChallengeId
);

router.post("/:id/evaluate", taskController.evaluateTask);

router.delete("/:id", taskController.deleteTask);

module.exports = router;
