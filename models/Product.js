const mongoose = require('mongoose')
const { Schema } = mongoose

const schema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    unique: true,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  cuantity: {
    type: Number,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  barcode: {
    type: Number,
    unique: true,
    required: true
  }
})

module.exports = mongoose.model('Product', schema)
