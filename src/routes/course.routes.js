const router = require("express").Router();
const {
  createCourse,
  getCoursesWithEvents,
  getCourseById,
  updateCourse,
  deleteCourse
} = require("../controllers/course.controller");

router.post("/", createCourse);
router.get("/", getCoursesWithEvents);
router.get("/:id", getCourseById);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

module.exports = router;
