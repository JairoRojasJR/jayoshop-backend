const Product = require('../models/Product');

const addProduct = async (req, res) => {
  const { name, description, price, cuantity, section, barcode } = req.body;

  const product = new Product({
    name,
    description,
    price,
    cuantity,
    section,
    barcode,
  });

  const dbRes = await product.save();
  if (dbRes) {
    return res.send({
      msg: 'Producto agregado exitosamente',
      product: dbRes,
      success: true,
    });
  }
  res.send({
    msg: 'Algo salió mal agregar el producto',
    success: false,
  });
};

const getProducts = async (req, res) => {
  const section = req.query.section;
  let products;
  if (section === 'todo') products = await Product.find({});
  else products = await Product.find({ section });
  res.send(products);
};

const deleteProducts = async (req, res) => {
  const products = req.body;
  let statusDelete;

  if (products.length > 1) {
    statusDelete = await Product.deleteMany({
      _id: products.map(product => product._id),
    });
  } else {
    statusDelete = await Product.deleteOne({ _id: products[0]._id });
  }

  const { acknowledged, deletedCount } = statusDelete;
  let msg;
  if (deletedCount === 1) msg = 'Producto eliminado exitosamente';
  else msg = `${deletedCount} productos eliminados exitosamente`;
  const deleteSuccess = acknowledged && deletedCount === products.length;

  if (deleteSuccess) return res.send({ status: 'ok', msg });
  res.send({
    status: 'failed',
    msg: 'Algo salio mal al eliminar los productos',
  });
};

const updateProducts = async (req, res) => {
  const product = { ...req.body[0] };
  const updated = await Product.updateOne({ _id: product._id }, product);
  const { acknowledged } = updated;
  if (acknowledged)
    return res.send({ status: 'ok', msg: 'Producto actualizado exitosamente' });
  res.send({
    status: 'failed',
    msg: 'Algo salió mal al actualizar el producto',
  });
};

module.exports = {
  addProduct,
  getProducts,
  deleteProducts,
  updateProducts,
};
