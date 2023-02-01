const mongoose = require('mongoose');
const { Schema } = mongoose;

const productsSchema = new Schema({
  name: {
    type: String,
    require: true
  },
  price: {
    type: String,
    require: true
  },
  description: {
    type: String,
    require: true
  },
  cuantity: {
    type: Number,
    require: true
  },
  barcode: {
    type: Number,
    require: true
  }
})

module.exports = mongoose.model('Product', productsSchema);