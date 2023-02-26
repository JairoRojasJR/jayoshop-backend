const mongoose = require('mongoose');
const { Schema } = mongoose;

const productsSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  cuantity: {
    type: Number,
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  barcode: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Product', productsSchema);
