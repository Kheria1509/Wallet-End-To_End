const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware');
const { User, Account, RecurringTransfer, Transaction, Notification } = require('../db');
const mongoose = require('mongoose');

// Create a new recurring transfer
router.post('/', authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { receiverId, amount, frequency, startDate, endDate, description } = req.body;
        const senderId = req.userId;

        // Validate receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(400).json({ message: "Receiver not found" });
        }

        // Create recurring transfer
        const recurringTransfer = await RecurringTransfer.create([{
            senderId,
            receiverId,
            amount,
            frequency,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            description
        }], { session });

        await session.commitTransaction();
        res.status(201).json({ message: "Recurring transfer scheduled successfully", transfer: recurringTransfer[0] });
    } catch (error) {
        await session.abortTransaction();
        console.error("Error creating recurring transfer:", error);
        res.status(500).json({ message: "Error scheduling recurring transfer" });
    } finally {
        session.endSession();
    }
});

// Get all recurring transfers for a user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const transfers = await RecurringTransfer.find({
            $or: [
                { senderId: req.userId },
                { receiverId: req.userId }
            ]
        })
        .populate('senderId', 'firstName lastName')
        .populate('receiverId', 'firstName lastName')
        .sort({ createdAt: -1 });

        res.json(transfers);
    } catch (error) {
        console.error("Error fetching recurring transfers:", error);
        res.status(500).json({ message: "Error fetching recurring transfers" });
    }
});

// Update recurring transfer status (pause/resume/cancel)
router.patch('/:transferId/status', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const transfer = await RecurringTransfer.findOne({
            _id: req.params.transferId,
            senderId: req.userId
        });

        if (!transfer) {
            return res.status(404).json({ message: "Recurring transfer not found" });
        }

        if (!['ACTIVE', 'PAUSED', 'COMPLETED'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        transfer.status = status;
        await transfer.save();

        res.json({ message: "Transfer status updated successfully", transfer });
    } catch (error) {
        console.error("Error updating recurring transfer:", error);
        res.status(500).json({ message: "Error updating recurring transfer" });
    }
});

// Delete a recurring transfer
router.delete('/:transferId', authMiddleware, async (req, res) => {
    try {
        const transfer = await RecurringTransfer.findOneAndDelete({
            _id: req.params.transferId,
            senderId: req.userId,
            status: { $ne: 'COMPLETED' }
        });

        if (!transfer) {
            return res.status(404).json({ message: "Recurring transfer not found or already completed" });
        }

        res.json({ message: "Recurring transfer deleted successfully" });
    } catch (error) {
        console.error("Error deleting recurring transfer:", error);
        res.status(500).json({ message: "Error deleting recurring transfer" });
    }
});

module.exports = router; 