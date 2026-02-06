const router = require("express").Router();
const users = require("../controllers/user.controller");
const { verifyToken, requireAdmin } = require("../middlewares/auth.middleware");

router.get("/", verifyToken, requireAdmin, users.getUsers);
router.post("/", verifyToken, requireAdmin, users.createUser);
router.put("/:id", verifyToken, requireAdmin, users.updateUser);
router.put("/:id/password", verifyToken, requireAdmin, users.resetUserPassword);
router.delete("/:id", verifyToken, requireAdmin, users.deleteUser);

module.exports = router;
