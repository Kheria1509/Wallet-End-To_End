require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('../db');
const { hashPassword } = require('../utils/auth');

async function migratePasswords() {
    try {
        const users = await User.find({});
        console.log(`Found ${users.length} users to migrate`);

        for (const user of users) {
            // Check if password might already be hashed (longer than 50 chars)
            if (user.password.length < 50) {
                const hashedPassword = await hashPassword(user.password);
                await User.updateOne(
                    { _id: user._id },
                    { $set: { password: hashedPassword } }
                );
                console.log(`Migrated password for user: ${user.username}`);
            }
        }

        console.log('Password migration completed successfully');
    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        await mongoose.disconnect();
    }
}

migratePasswords();