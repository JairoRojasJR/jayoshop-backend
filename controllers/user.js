const { nanoid } = require('nanoid')

const userRegister = (req, res) => {
  const { name, lastname, email, password } = req.body
  try {
    const User = require('../models/users')
    const newUser = new User({
      name,
      lastname,
      email,
      password,
      tokenConfirm: nanoid(10)
    })
    newUser.save()
    res.json(newUser)
  } catch (err) {
    console.log(err)
  }
}

module.exports = {
  userRegister
}
