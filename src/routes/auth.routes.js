const router = require("express").Router();
const { register, login } = require("../controllers/auth.controller");
const { verifyToken, requireAdmin } = require("../middlewares/auth.middleware");

router.post("/register", register);
router.post("/login", login);

router.get(
  "/admin/only",
  verifyToken,
  requireAdmin,
  (req, res) => {
    res.json({ message: "Welcome Admin" });
  }
);

module.exports = router;
