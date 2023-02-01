module.exports = getAuthData = req => {
  if (req.user) return req.user;
  let ipClient = req.ip.split(':')[0];
  let authData = {
    rol: 'client',
    isIpAdmin: false,
    authenticated: false,
    ipClient: ipClient,
  };
  if (
    ipClient === process.env.ADMIN_IP ||
    (process.env.MODE === 'dev' && req.ip === process.env.ADMIN_IP)
  ) {
    authData.rol = 'admin';
    authData.isIpAdmin = true;
  }
  return authData;
};
