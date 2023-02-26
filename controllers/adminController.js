const Product = require('../models/Product');
const { getContainerClient } = require('../services/stream');
const multer = require('multer');
const { nanoid } = require('nanoid');

const addProduct = async (req, res) => {
  let containerClient;
  try {
    containerClient = getContainerClient();
  } catch (err) {
    return res.status(400).json({ error: 'Conexión con el Storage fallida' });
  }

  const storage = multer.memoryStorage();
  const upload = multer({
    storage,
    limits: {
      files: 1,
      fileSize: 10000000,
      fields: 7,
    },
  });

  return upload.single('image')(req, res, async err => {
    try {
      if(!req.file) throw new Error('La imagen es requerida');
      const fieldsRequired = [
        'name',
        'description',
        'price',
        'cuantity',
        'section',
        'barcode',
      ];

      fieldsRequired.map(field => {
        if(!req.body[field]) throw new Error(`El campo (${field}) es requerido`);
      })
      if (err) return res.status(400).json({ error: err.message });

      const file = req.file;

      const splitFileName = file.originalname.split('.');
      const fileName = splitFileName[0];
      const fileExtension = `.${splitFileName[1]}`;

      const blobNameImage = fileName + '--id--' + nanoid(10) + fileExtension;
      const blockBlobClient = containerClient.getBlockBlobClient(blobNameImage);

      const { name, description, price, cuantity, section, barcode } = req.body;

      const product = new Product({
        name,
        description,
        image: blobNameImage,
        price,
        cuantity,
        section: section.toLowerCase(),
        barcode,
      });

      const dbRes = await product.save();
      if (!dbRes) {
        throw Error('Algo inesperado sucedió en la base de datos');
      }

      const buffer = file.buffer;
      await blockBlobClient.upload(buffer, buffer.length);
      return res
        .status(201)
        .json({ message: 'Producto agreado al inventario', product: dbRes });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
};

const getProducts = async (req, res) => {
  const section = req.query.section;
  let products;
  if (section === 'todo') products = await Product.find({}).lean();
  else products = await Product.find({ section }).lean();
  res.json(products);
};

const deleteProduct = async (req, res) => {
  const products = req.body;
  let containerClient;

  try {
    containerClient = getContainerClient();
  } catch (error) {
    return res.status(400).json({ error: 'Conexión con el Storage fallida' });
  }

  const deleteInDB = async product => {
    const { _id, image } = product;

    const blockBlobClient = containerClient.getBlockBlobClient(image);
    blockBlobClient.delete();

    const dbRes = await Product.deleteOne({ _id });
    const { acknowledged, deletedCount } = dbRes;

    if (acknowledged && deletedCount) {
      return { message: 'Producto eliminado' };
    } else if (acknowledged && deletedCount === 0) {
      throw new Error('BBDD: El producto no se encontró');
    } else throw new Error('BBDD: Error durante en la operación');
  };

  try {
    if (products.length > 1) {
      let count = 1;
      for (let product in products) {
        await deleteInDB(products[product]);
        if (count === products.length) {
          return res.json({ message: `${count} productos eliminados` });
        }
        count++;
      }
      throw new Error('Error durante la ejecución');
    }

    const product = req.body[0];
    return res.json(await deleteInDB(product));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const updateProduct = async (req, res) => {
  let containerClient;
  try {
    containerClient = getContainerClient();
  } catch (error) {
    return res.status(400).json({ error: 'Conexión con el Storage fallida' });
  }

  try {
    const storage = multer.memoryStorage();
    const upload = multer({
      storage,
      limits: {
        files: 1,
        fileSize: 10000000,
        fields: 7,
      },
    });

    return upload.single('image')(req, res, async err => {
      const product = { ...req.body };
      const idProduct = product._id;
      delete product._id;

      const dbSave = async (product, idProduct, options) => {
        if (product.section) product.section = product.section.toLowerCase();
        const updated = await Product.updateOne({ _id: idProduct }, product);

        const { acknowledged } = updated;
        if (acknowledged) {
          if (options) {
            const { blockBlobClientOld, optionsBlob } = options.sources;
            blockBlobClientOld.delete(optionsBlob);
          }
          return res.json({ message: 'Producto actualizado exitosamente' });
        }

        if (options) {
          const { blockBlobClient, optionsBlob } = options.sources;
          blockBlobClient.delete(optionsBlob);
        }
        res.status(400);
        return res.json({ error: 'BBDD: Algo salió mal' });
      };

      if (req.file) {
        const image = req.file;
        const imageNameSplit = image.originalname.split('.');

        const imageName = imageNameSplit[0];
        const blobNameId = '--id--' + nanoid(5);
        const imageExtension = imageNameSplit[1];

        const blobName = imageName + blobNameId + '.' + imageExtension;
        const buffer = image.buffer;

        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.upload(buffer, buffer.length);

        delete product.oldImage;
        product.image = blobName;

        const old = req.body.oldImage;
        const options = {
          thereImage: true,
          sources: {
            optionsBlob: { deleteSnapshots: 'include' },
            blockBlobClientOld: containerClient.getBlockBlobClient(old),
            blockBlobClient,
          },
        };
        return dbSave(product, idProduct, options);
      }
      return dbSave(product, idProduct);
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
};
