require('dotenv').config();
const express = require("express");
const cors = require("cors");
const rootRouter = require("./routes/index");

const app = express();

// Enable CORS
app.use(cors());

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check or landing route
app.get("/", (req, res) => {
  res.send("API is running ✅");
});

// Mount your API routes under /api/v1
app.use("/api/v1", rootRouter);

// Start recurring transfer scheduler
require('./scripts/recurringTransferScheduler');

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something broke!"
  });
});

// Only listen locally if not in production (Vercel handles serverless export)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export the app for Vercel serverless
module.exports = app;
