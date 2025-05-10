const cron = require('node-cron');
const mongoose = require('mongoose');
const { RecurringTransfer, Account, Transaction, Notification } = require('../db');

async function executeTransfer(transfer, session) {
    const senderAccount = await Account.findOne({ userId: transfer.senderId }).session(session);
    const receiverAccount = await Account.findOne({ userId: transfer.receiverId }).session(session);

    if (senderAccount.balance < transfer.amount) {
        throw new Error('Insufficient balance');
    }

    // Update balances
    senderAccount.balance -= transfer.amount;
    receiverAccount.balance += transfer.amount;

    // Create transaction record
    const transaction = new Transaction({
        senderId: transfer.senderId,
        receiverId: transfer.receiverId,
        amount: transfer.amount,
    });

    // Create notifications
    const senderNotification = new Notification({
        userId: transfer.senderId,
        type: 'DEBIT',
        amount: transfer.amount,
        message: `Recurring transfer of ₹${transfer.amount} sent to ${transfer.receiverId}`
    });

    const receiverNotification = new Notification({
        userId: transfer.receiverId,
        type: 'CREDIT',
        amount: transfer.amount,
        message: `Recurring transfer of ₹${transfer.amount} received from ${transfer.senderId}`
    });

    // Save all changes
    await Promise.all([
        senderAccount.save({ session }),
        receiverAccount.save({ session }),
        transaction.save({ session }),
        senderNotification.save({ session }),
        receiverNotification.save({ session })
    ]);

    return transaction;
}

async function processRecurringTransfers() {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const now = new Date();
        const transfers = await RecurringTransfer.find({
            status: 'ACTIVE',
            $or: [
                { lastExecuted: { $exists: false } },
                {
                    $and: [
                        { frequency: 'DAILY', lastExecuted: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } },
                        { $or: [{ endDate: { $exists: false } }, { endDate: { $gt: now } }] }
                    ]
                },
                {
                    $and: [
                        { frequency: 'WEEKLY', lastExecuted: { $lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } },
                        { $or: [{ endDate: { $exists: false } }, { endDate: { $gt: now } }] }
                    ]
                },
                {
                    $and: [
                        { frequency: 'MONTHLY', lastExecuted: { $lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } },
                        { $or: [{ endDate: { $exists: false } }, { endDate: { $gt: now } }] }
                    ]
                }
            ]
        }).session(session);

        for (const transfer of transfers) {
            try {
                await executeTransfer(transfer, session);
                transfer.lastExecuted = now;
                
                // Check if this is the last transfer before endDate
                if (transfer.endDate && transfer.endDate <= now) {
                    transfer.status = 'COMPLETED';
                }
                
                await transfer.save({ session });
            } catch (error) {
                console.error(`Error processing recurring transfer ${transfer._id}:`, error);
                transfer.status = 'FAILED';
                await transfer.save({ session });
            }
        }

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        console.error('Error in recurring transfer scheduler:', error);
    } finally {
        session.endSession();
    }
}

// Run every hour
cron.schedule('0 * * * *', async () => {
    console.log('Running recurring transfer scheduler...');
    await processRecurringTransfers();
});

module.exports = { processRecurringTransfers }; 