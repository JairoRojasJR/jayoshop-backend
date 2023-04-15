const mongoose = require('mongoose')
const { Schema } = mongoose
const bcrypt = require('bcrypt')

const userSchema = new Schema({
  name: {
    type: String,
    upperCase: true,
    required: true
  },
  lastname: {
    type: String,
    upperCase: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  tokenConfirm: {
    type: String,
    require: true
  },
  isConfirmed: {
    type: Boolean,
    default: false
  }
})

userSchema.pre('save', async function (next) {
  const user = this
  if (!user.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(user.password, salt)

    user.password = hash
    next()
  } catch (error) {
    console.log(error)
    next()
  }
})

module.exports = mongoose.model('User', userSchema)
