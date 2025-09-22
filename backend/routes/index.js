// Route index file - exports all route modules
const authRoutes = require('./auth');
const userRoutes = require('./user');
const stockRoutes = require('./stocks');
const tradingRoutes = require('./trading');
const fundsRoutes = require('./funds');

module.exports = {
  authRoutes,
  userRoutes,
  stockRoutes,
  tradingRoutes,
  fundsRoutes
};
