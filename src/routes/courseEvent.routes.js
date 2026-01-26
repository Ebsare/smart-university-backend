const router = require("express").Router();
const {
  createCourseEvent,
  getEventsByCourse
} = require("../controllers/courseEvent.controller");

router.post("/", createCourseEvent);
router.get("/", getEventsByCourse);

module.exports = router;
