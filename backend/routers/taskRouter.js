const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

router.get("/all", taskController.getAllTasks);
router.get("/", taskController.getTaskByDate);
router.get("/forum-post", taskController.getTasksForForumPost);
router.get("/:id/test-case", taskController.fetchTestCaseForToday);
router.get("/:id/test-cases", taskController.getAllTestCasesForTask);
router.get("/test-cases/:testCaseId", taskController.getSpecificTestCaseById);
router.get("/search", taskController.searchTaskByDate);
router.put(
  "/users/:userId/daily-test-case-id",
  taskController.updateUserDailyChallengeId
);

router.post("/:id/evaluate", taskController.evaluateTask);
router.post("/create", taskController.createNewTask);

router.delete("/:id", taskController.deleteTask);

module.exports = router;
