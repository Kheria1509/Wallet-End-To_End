const express = require("express");
const userRouter = require("./user");
const accountRouter = require("./account");
const notificationRouter = require("./notification");

const router = express.Router();

router.use("/user", userRouter);
router.use("/account", accountRouter);
router.use("/notifications", notificationRouter);

module.exports = router;
