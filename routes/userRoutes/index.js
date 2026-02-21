const express = require("express");
const router = express.Router();

const customerRoutes = require("./userRouter");

// Mount customer routes
router.use("/", customerRoutes);

module.exports = router;
