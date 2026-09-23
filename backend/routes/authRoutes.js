const router = require("express").Router();
const {
  registerUser,
  loginUser,
  getMe,
  logout,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.post("/logout", logout);
module.exports = router;
