const router = require("express").Router();
router.post(
  "/calculate",
  require("../middleware/auth").protect,
  require("../controllers/commuteController").calculateRoutes,
);
module.exports = router;
