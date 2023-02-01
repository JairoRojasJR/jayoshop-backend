const getAuthData = require('../services/getAuthData');

const getIsAuth = (req, res) => {
  const authData = getAuthData(req);
  res.send(authData);
};

const loginAdmin = async (req, res) => {
  if (req.user) return res.send(user);
  const { username, password } = req.body;

  const verifyUsername = username === process.env.ADMIN_USERNAME;
  const verifyPass = password === process.env.ADMIN_PASS;

  if (verifyUsername && verifyPass) {
    let user = getAuthData(req);
    user.authenticated = true;
    req.login(user, function (err) {
      if (err) {
        return res.send({
          success: false,
          msg: 'Surgió un error durante la autenticación',
        });
      }
      return res.send({ success: true, msg: 'Éxito al ingresar' });
    });
  } else {
    res.send({ success: false, msg: 'Usuario o contraseña incorrecta' });
  }
};

const logoutAdmin = (req, res) => {
  res.clearCookie('connect.sid');
  if (!req.user)
    return res.send({ success: false, msg: 'No hay ninguna sesión activa' });
  req.session.destroy();
  res.send({ success: true, msg: 'Sesión cerrada' });
};

module.exports = {
  getIsAuth,
  loginAdmin,
  logoutAdmin,
};
