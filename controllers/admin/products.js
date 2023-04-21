const Product = require('../../models/Product')
const Section = require('../../models/Section')
const {
  createBlobName,
  uploadBlob,
  updateBlob,
  deleteBlob
} = require('../../services/stream')
const {
  queryUpdateSuccess,
  queryDeleteSuccess
} = require('../../services/dbQuerySuccess')
const multer = require('multer')

const addProduct = async (req, res) => {
  const storage = multer.memoryStorage()
  const upload = multer({
    storage,
    limits: {
      fields: 7,
      files: 1,
      fileSize: 10000000
    }
  })

  return upload.single('image')(req, res, async error => {
    const saving = {}

    try {
      if (error) throw error

      const { name, description, price, cuantity, section, barcode } = req.body
      const file = req.file

      let missing
      if (!name) missing = 'name'
      else if (!description) missing = 'description'
      else if (!price) missing = 'price'
      else if (!cuantity) missing = 'cuantity'
      else if (!section) missing = 'section'
      else if (!barcode) missing = 'barcode'

      if (missing) throw new Error(`El campo (${missing}) es requerido`)
      else if (!file) throw new Error('La imagen es requerida')

      const alreadyExists = await Product.findOne({ name }).lean()
      if (alreadyExists) throw new Error(`El producto (${name}) ya existe`)

      const barcodeAlreadyExists = await Product.findOne({ barcode }).lean()
      if (barcodeAlreadyExists) {
        const error = `El código de barras (${barcode}) ya está asociado a otro producto`
        throw new Error(error)
      }

      const sectionExists = await Section.findOne({ name: section }).lean()
      if (!sectionExists) throw new Error(`La sección (${section}) no existe`)

      const blobName = createBlobName('products/', file.originalname)

      const product = new Product({
        name,
        description,
        image: blobName,
        price,
        cuantity,
        section,
        barcode
      })

      const dbRes = await product.save()
      if (!dbRes) throw Error('BBDD: Operación fallida')
      saving.dbSuccess = true
      saving.product = dbRes

      const buffer = file.buffer
      await uploadBlob(blobName, buffer)
      saving.blobUploaded = true

      return res.status(201).json({
        message: 'Producto agreado',
        product: dbRes
      })
    } catch (error) {
      const resBody = { error: error.message, saving }

      if (saving.dbSuccess) {
        resBody.reset = { action: 'delete product in db' }
        try {
          const { _id, name } = saving.product
          const dbRes = await Product.deleteOne({ _id })
          queryDeleteSuccess({ dbRes, target: `el producto ${name}`, _id })
          resBody.reset.success = true
        } catch (errorDeletingInDB) {
          resBody.reset.success = false
          resBody.reset.error = errorDeletingInDB.message
        }
      }

      return res.status(400).json(resBody)
    }
  })
}

const updateProduct = async (req, res) => {
  const storage = multer.memoryStorage()
  const upload = multer({
    storage,
    limits: {
      fields: 8,
      files: 1,
      fileSize: 10000000
    }
  })

  return upload.single('image')(req, res, async error => {
    try {
      if (error) throw error

      const product = req.body
      const { _id, name, section, barcode } = product
      const file = req.file

      if (!_id) throw new Error('Se requiere el ID del producto a actualizar')
      const withoutFields = Object.entries(product).length < 2
      if (withoutFields && !file) throw new Error('No se recibió ningún campo')

      const oldProduct = await Product.findById(_id)
      if (oldProduct === null) {
        throw new Error(`No se encontró el producto con id: ${_id}`)
      }

      if (section) {
        const sectionNotExists = await Section.findOne({ name: section }).lean()
        if (!sectionNotExists) {
          throw new Error(`La sección (${section}) no existe`)
        }
      }

      for (const field in product) {
        if (field === '_id') continue
        let error
        const unexpected = oldProduct[field] === undefined
        const unchanged = product[field] === oldProduct[field]

        if (unexpected) error = `Campo ${field} inesperado`
        if (unchanged) error = 'Se ha recibido un campo sin cambios'
        if (error) throw new Error(error)
      }

      if (name) {
        const alreadyExists = await Product.findOne({ name }).lean()
        if (alreadyExists) throw new Error(`El producto (${name}) ya existe`)
      }

      if (barcode) {
        const alreadyExists = await Product.findOne({ barcode }).lean()
        if (alreadyExists) {
          const error = `El código de barras (${barcode}) ya está asociado a otro producto`
          throw new Error(error)
        }
      }

      const oldName = oldProduct.name
      const oldImage = oldProduct.image

      if (file) product.image = await updateBlob('products/', file, oldImage)

      const dbRes = await Product.updateOne({ _id }, product)
      queryUpdateSuccess({ dbRes, target: `el producto ${oldName}`, _id })

      return res.json({ message: 'Producto actualizado' })
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  })
}

const deleteProduct = async (req, res) => {
  const deleting = { count: 0, product: null, db: false, blob: false }

  try {
    const resetDeleting = () => {
      deleting.product = null
      deleting.db = false
      deleting.blob = false
    }

    const getProduct = async toDelete => {
      const { _id } = toDelete
      if (!_id) throw new Error('Se requiere el ID del producto a eliminar')
      const product = await Product.findById(_id).lean()
      if (product) return product
      throw new Error(`No se encontró el producto con ID: ${_id}`)
    }

    const runDelete = async product => {
      const { _id, name, image } = product
      deleting.product = product

      const dbRes = await Product.deleteOne({ _id })
      queryDeleteSuccess({ dbRes, _id, target: `el producto ${name}` })
      deleting.db = true

      await deleteBlob(image)
      deleting.blob = true
    }

    if (Array.isArray(req.body)) {
      const productsToDelete = req.body
      if (productsToDelete.length < 2) {
        throw new Error('Se requiere al menos dos productos a eliminar')
      }

      for (const toDelete of productsToDelete) {
        resetDeleting()
        const product = await getProduct(toDelete)
        await runDelete(product)
        deleting.count++
      }

      return res.json({ message: `${deleting.count} productos eliminados` })
    }

    const product = await getProduct(req.body)
    await runDelete(product)

    return res.json({ message: `Producto (${product.name}) eliminado` })
  } catch (error) {
    const resBody = { error: error.message, deleting }

    if (deleting.db === true) {
      resBody.reset = { action: 'Recuperar producto eliminado en db' }
      try {
        const product = new Product(deleting.product)
        await product.save()
        resBody.reset.sucess = true
      } catch (errorRecoveringInDB) {
        resBody.reset.sucess = false
        resBody.reset.error = errorRecoveringInDB.message
      }
    }

    return res.status(400).json(resBody)
  }
}

const productSeller = async (req, res) => {
  try {
    const products = req.body
    if (!Array.isArray(products)) throw new Error('Se esperaba un Array[]')
    const billingProducts = []

    for (const product of products) {
      const { _id, cuantity } = product

      if (cuantity === 0) {
        throw new Error(
          `Se ha recibo el producto con id ${_id} con 0 en cantidad a eliminar`
        )
      } else if (!_id) {
        throw new Error(
          'Falta el id ({"_id": "abc1234"}) del producto a eliminar'
        )
      } else if (!cuantity) {
        throw new Error(
          'Falta la cantidad ({"cuantity": 2}) del a eliminar del producto'
        )
      }

      const dbProduct = await Product.findById(_id)
      if (dbProduct.cuantity - cuantity < 0) {
        throw new Error(
          `No hay stock suficiente para vender ${cuantity} de ${dbProduct.cuantity} (${dbProduct.name}) disponibles`
        )
      }

      billingProducts.push({ data: dbProduct, cuantity })
    }

    for (const product of billingProducts) {
      const { data, cuantity } = product
      const cuantityAfterSelling = data.cuantity - cuantity
      await Product.findByIdAndUpdate(data._id, {
        cuantity: cuantityAfterSelling
      })
    }

    return res.json({ message: 'Venta finalizada con éxito' })
  } catch (error) {
    return res.json({ error: error.message })
  }
}

module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
  productSeller
}
