const getAuthData = require('../services/getAuthData')

module.exports = async (req, res, next) => {
  if (req.isAuthenticated()) return next()
  const authData = getAuthData(req.ip)
  authData.isAdminAuthenticated = false
  authData.isAuthenticated = false
  return res.json(authData)
}
