module.exports = reqIp => {
  const reqSplit = reqIp.split(':')
  const ip = reqSplit[0] || reqSplit[reqSplit.length - 1]
  const isIpAdmin = ip === process.env.ADMIN_IP || global.adminModeForced

  const authData = {
    rol: isIpAdmin ? 'admin' : 'client',
    isIpAdmin,
    ip
  }

  const isProdMode = globalThis.isProdMode
  if (!isProdMode) authData.adminModeForced = globalThis.adminModeForced
  return authData
}
