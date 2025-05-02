const express = require("express");
const { authMiddleware } = require("../middleware");
const { Account, Transaction, User } = require("../db");
const { default: mongoose } = require("mongoose");

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
  const account = await Account.findOne({
    userId: req.userId,
  });

  res.json({
    balance: account.balance,
  });
});

router.get("/transactions", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find({
        $or: [{ senderId: req.userId }, { receiverId: req.userId }]
      })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'firstName lastName')
      .populate('receiverId', 'firstName lastName'),
      
      Transaction.countDocuments({
        $or: [{ senderId: req.userId }, { receiverId: req.userId }]
      })
    ]);

    res.json({ 
      transactions,
      hasMore: total > skip + transactions.length
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

router.post("/transfer", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount, to } = req.body;

    const account = await Account.findOne({ userId: req.userId }).session(session);
    if (!account || account.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Insufficient balance",
      });
    }

    const toAccount = await Account.findOne({ userId: to }).session(session);
    if (!toAccount) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Invalid account",
      });
    }

    // Update balances
    await Account.updateOne(
      { userId: req.userId },
      { $inc: { balance: -amount } }
    ).session(session);
    await Account.updateOne(
      { userId: to },
      { $inc: { balance: amount } }
    ).session(session);

    // Record the transaction
    await Transaction.create([{
      senderId: req.userId,
      receiverId: to,
      amount: amount
    }], { session });

    await session.commitTransaction();
    res.json({
      message: "Transfer successful",
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      message: "Transfer failed",
    });
  } finally {
    session.endSession();
  }
});

module.exports = router;
