const router = require("express").Router();
const {
  enrollInCourse,
  getMyCourses,
  unenrollFromCourse
} = require("../controllers/userCourse.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post("/enroll", verifyToken, enrollInCourse);
router.get("/my-courses", verifyToken, getMyCourses);
router.delete("/unenroll/:courseId", verifyToken, unenrollFromCourse);

module.exports = router;
