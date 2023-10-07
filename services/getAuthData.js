module.exports = IP => {
  let isAdmin = false
  const cleanIp = IP.split(':').shift() || IP.split(':').pop()

  const sameMachine = IP === '::1' || cleanIp === '127.0.0.1'
  const isAdminIp = cleanIp === process.env.ADMIN_IP

  const prodModeEnable = globalThis.PROD_MODE_ENABLE
  const adminModeForced = globalThis.ADMIN_MODE_FORCED

  if ((prodModeEnable && isAdminIp) || adminModeForced) isAdmin = true
  else if (!prodModeEnable) {
    if (isAdminIp || sameMachine) isAdmin = true
  }

  const authData = {
    isAdmin,
    rol: isAdmin ? 'admin' : 'client',
    isIpAdmin: isAdminIp,
    ip: IP,
    cleanIp
  }

  if (!prodModeEnable) {
    const devProperties = {
      sameMachine,
      mode: process.env.MODE
    }

    Object.assign(authData, devProperties)
  }

  if (adminModeForced) Object.assign(authData, { adminModeForced })

  return authData
}
