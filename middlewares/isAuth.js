const getAuthData = require('../services/getAuthData');

module.exports = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  const authData = getAuthData(req);
  res.send(authData);
};
