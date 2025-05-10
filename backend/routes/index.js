const express = require("express");
const userRouter = require("./user");
const accountRouter = require("./account");
const notificationRouter = require("./notification");
const recurringRouter = require("./recurring");

const router = express.Router();

router.use("/user", userRouter);
router.use("/account", accountRouter);
router.use("/notification", notificationRouter);
router.use("/recurring", recurringRouter);

module.exports = router;
