const express = require("express");
const router = express.Router();
const adminRouter = require("./adminRouter");

router.use("/", adminRouter);

module.exports = router;
