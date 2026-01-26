const router = require("express").Router();
const {
  enrollInCourse,
  getMyCourses
} = require("../controllers/userCourse.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post("/enroll", verifyToken, enrollInCourse);
router.get("/my-courses", verifyToken, getMyCourses);

module.exports = router;
