const router = require("express").Router();
const {
  selectRoute,
  history,
  removeTrip,
} = require("../controllers/userController");
router.use(require("../middleware/auth").protect);
router.post("/select-route", selectRoute);
router.get("/trips", history);
router.delete("/trips/:id", removeTrip);
module.exports = router;
