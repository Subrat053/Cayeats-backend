const express = require("express");
const router = express.Router();

const {
  registerCustomer,
  loginCustomer,
  getUserProfile,
} = require("../../controllers/users/userController");
// const { protect } = require("../../middleware/auth.middleware");
const { isCustomer } = require("../../middleware/role.middleware");

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.get("/getuserDetails", getUserProfile);

module.exports = router;
