const isEdgeRuntime = process.env.VERCEL_ENV === 'production';

let middlewareModule;
try {
  if (isEdgeRuntime) {
    middlewareModule = require('./middleware/edgeMiddleware');
  } else {
    middlewareModule = require('./middleware');
  }
} catch (error) {
  console.error('Error loading middleware:', error);
  // Fallback to regular middleware if edge middleware fails to load
  middlewareModule = require('./middleware');
}

module.exports = middlewareModule; 