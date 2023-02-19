module.exports = getAuthData = req => {
  if (req.user) return req.user;
  let ipClient = req.ip.split(':')[0];
  let authData = {
    rol: 'client',
    isIpAdmin: false,
    authenticated: false,
    ipClient: ipClient,
  };
  const isIpAdmin = ipClient === process.env.ADMIN_IP;
  const forceAdminMode = process.env.FORCE_ADMIN_MODE === 'force';

  if (isIpAdmin || forceAdminMode) {
    authData.rol = 'admin';
    authData.isIpAdmin = true;
  }
  return authData;
};
