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

    // Parse filter parameters
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    const minAmount = req.query.minAmount ? parseFloat(req.query.minAmount) : null;
    const maxAmount = req.query.maxAmount ? parseFloat(req.query.maxAmount) : null;

    // Build filter query
    const filterQuery = {
      $or: [{ senderId: req.userId }, { receiverId: req.userId }]
    };

    // Add date range filter if provided
    if (startDate || endDate) {
      filterQuery.timestamp = {};
      if (startDate) {
        filterQuery.timestamp.$gte = startDate;
      }
      if (endDate) {
        filterQuery.timestamp.$lte = new Date(endDate.setHours(23, 59, 59, 999));
      }
    }

    // Add amount range filter if provided
    if (minAmount !== null || maxAmount !== null) {
      filterQuery.amount = {};
      if (minAmount !== null) {
        filterQuery.amount.$gte = minAmount;
      }
      if (maxAmount !== null) {
        filterQuery.amount.$lte = maxAmount;
      }
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filterQuery)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('senderId', 'firstName lastName')
        .populate('receiverId', 'firstName lastName'),
      
      Transaction.countDocuments(filterQuery)
    ]);

    res.json({ 
      transactions,
      hasMore: total > skip + transactions.length,
      total
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

router.get("/transactions/export", authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, minAmount, maxAmount } = req.query;

    // Build filter query
    const filterQuery = {
      $or: [{ senderId: req.userId }, { receiverId: req.userId }]
    };

    // Add date range filter if provided
    if (startDate || endDate) {
      filterQuery.timestamp = {};
      if (startDate) {
        filterQuery.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filterQuery.timestamp.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
      }
    }

    // Add amount range filter if provided
    if (minAmount || maxAmount) {
      filterQuery.amount = {};
      if (minAmount) {
        filterQuery.amount.$gte = parseFloat(minAmount);
      }
      if (maxAmount) {
        filterQuery.amount.$lte = parseFloat(maxAmount);
      }
    }

    const transactions = await Transaction.find(filterQuery)
      .sort({ timestamp: -1 })
      .populate('senderId', 'firstName lastName')
      .populate('receiverId', 'firstName lastName');

    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions for export:", error);
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
