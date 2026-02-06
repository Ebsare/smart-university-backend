const router = require("express").Router();
const course = require("../controllers/course.controller");
const { verifyToken, requireAdmin } = require("../middlewares/auth.middleware");

// READ (të gjithë userat e loguar)
router.get("/", verifyToken, course.getCourses);
router.get("/:id", verifyToken, course.getCourseById);

// ADMIN CRUD (vetëm admin)
router.post("/", verifyToken, requireAdmin, course.createCourse);
router.put("/:id", verifyToken, requireAdmin, course.updateCourse);
router.delete("/:id", verifyToken, requireAdmin, course.deleteCourse);

module.exports = router;
