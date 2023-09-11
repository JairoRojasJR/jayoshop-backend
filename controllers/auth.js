const getAuthData = require('../services/getAuthData')

const getUserData = async (req, res) => {
  if (req.user) return res.json(req.user)
  res.clearCookie('connect.sid')
  req.session.destroy()
  return res.status(400).json({ error: 'Usuario no autenticado' })
}

const login = async (req, res) => {
  try {
    if (req.isAuthenticated()) throw new Error('Usuario ya autenticado')
    const { username, password } = req.body

    if (!username) throw new Error('El campo (username) es requerido')
    if (!password) throw new Error('El campo (password) es requerido')

    const isAdminUsername = username === process.env.ADMIN_USERNAME
    const isAdminPass = password === process.env.ADMIN_PASS
    const user = getAuthData(req.ip)

    if (isAdminUsername && isAdminPass && user.isAdmin) {
      user.isAuthenticated = true
      user.isAdminAuthenticated = true

      return req.login(user, function (error) {
        if (error) return res.status(400).json({ error: error.message })
        return res.json({ message: 'Éxito al ingresar', authData: user })
      })
    }

    // throw new Error('Usuario o contraseña incorrecta')

    return res.json({ message: 'utenticando user...', authData: user })
  } catch (error) {
    const resBody = { error: error.message }
    if (req.user) resBody.authData = req.user
    return res.status(400).json(resBody)
  }
}

const logout = (req, res) => {
  const authData = getAuthData(req.ip)

  if (!req.user) {
    return res.status(400).json({
      error: 'No hay ninguna sesión activa',
      authData
    })
  }

  req.logout(function (error) {
    if (error) return res.send({ error: error.message })
    req.session.destroy(function (error) {
      if (error) return res.send({ error: error.message })
      authData.isAuthenticated = false
      res.json({ message: 'Sesión cerrada', authData })
    })
  })
}

module.exports = {
  getUserData,
  login,
  logout
}
