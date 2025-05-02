const express = require("express");
const { authMiddleware } = require("../middleware");
const { Account, Transaction, User, Notification } = require("../db");
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

    if (!amount || amount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Invalid amount",
      });
    }

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

    // Get user details for notification messages
    const [sender, receiver] = await Promise.all([
      User.findById(req.userId).session(session),
      User.findById(to).session(session)
    ]);

    if (!sender || !receiver) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Invalid sender or receiver",
      });
    }

    // Update balances
    await Promise.all([
      Account.updateOne(
        { userId: req.userId },
        { $inc: { balance: -amount } }
      ).session(session),
      Account.updateOne(
        { userId: to },
        { $inc: { balance: amount } }
      ).session(session)
    ]);

    // Record the transaction
    const transaction = await Transaction.create(
      [{
        senderId: req.userId,
        receiverId: to,
        amount: amount
      }],
      { session, ordered: true }
    );

    // Create notifications for both sender and receiver
    const notifications = await Notification.create(
      [
        {
          userId: req.userId,
          type: 'DEBIT',
          amount: amount,
          message: `₹${amount} sent to ${receiver.firstName} ${receiver.lastName}`
        },
        {
          userId: to,
          type: 'CREDIT',
          amount: amount,
          message: `₹${amount} received from ${sender.firstName} ${sender.lastName}`
        }
      ],
      { session, ordered: true }
    );

    await session.commitTransaction();
    res.json({
      message: "Transfer successful",
      transaction: transaction[0],
      notifications
    });
  } catch (error) {
    console.error("Transfer error:", error);
    await session.abortTransaction();
    res.status(500).json({
      message: "Transfer failed: " + (error.message || "Unknown error")
    });
  } finally {
    session.endSession();
  }
});

module.exports = router;
