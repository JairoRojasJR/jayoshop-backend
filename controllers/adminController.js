const Product = require('../models/Product');

const getProducts = async (req, res) => {
  const products = await Product.find({});
  res.send(products);
};

const addProduct = async (req, res) => {
  const { name, price, description, cuantity, barcode } = req.body;

  const product = new Product({
    name,
    price,
    description,
    cuantity,
    barcode,
  });

  await product.save();
  res.send({
    msg: 'Producto recibido',
    product: req.body,
  });
};

module.exports = {
  addProduct,
  getProducts,
};
