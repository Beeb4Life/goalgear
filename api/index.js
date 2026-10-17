/**
 * GoalGear - Vercel Serverless Function Handler
 *
 * Exports the Express app instance for Vercel's Node.js runtime.
 */

const app = require('../src/app');

module.exports = app;
