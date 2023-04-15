const mongoose = require('mongoose')
const { Schema } = mongoose

const schema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  image: {
    type: String,
    unique: true,
    required: true
  }
})

module.exports = mongoose.model('Section', schema)
