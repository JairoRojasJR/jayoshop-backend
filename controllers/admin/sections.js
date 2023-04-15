const Section = require('../../models/Section')
const Product = require('../../models/Product')
const multer = require('multer')
const {
  createBlobName,
  uploadBlob,
  updateBlob,
  deleteBlob
} = require('../../services/stream')
const {
  queryDeleteSuccess,
  queryUpdateSuccess
} = require('../../services/dbQuerySuccess')

const addSection = async (req, res) => {
  const storage = multer.memoryStorage()
  const upload = multer({
    storage,
    limits: {
      fields: 2,
      files: 1,
      fileSize: 10000000
    }
  })

  return upload.single('image')(req, res, async error => {
    const saving = {}

    try {
      if (error) throw error

      const { name } = req.body
      const imageFile = req.file

      if (!name) throw new Error('Nombre requerido')
      else if (!imageFile) throw new Error('Imagen requerida')

      const alreadyExists = await Section.findOne({ name }).lean()
      if (alreadyExists) throw new Error(`La sección (${name}) ya existe`)

      const blobName = createBlobName('sections/', imageFile.originalname)
      const section = new Section({ name, image: blobName })
      const dbRes = await section.save()

      if (!dbRes) throw new Error('BBDD: Operación fallida')
      saving.dbSuccess = true
      saving.section = dbRes

      const buffer = imageFile.buffer
      await uploadBlob(blobName, buffer)
      saving.blobUploaded = true

      return res.status(201).json({
        message: 'Sección agredada',
        section: dbRes
      })
    } catch (error) {
      const resBody = { error: error.message, saving }

      if (saving.dbSuccess) {
        resBody.reset = { action: 'delete section in db' }
        try {
          const { _id, name } = saving.section
          const dbRes = await Section.deleteOne({ _id })
          queryDeleteSuccess({ dbRes, target: `la sección ${name}`, _id })
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

const updateSection = async (req, res) => {
  const storage = multer.memoryStorage()
  const upload = multer({
    storage,
    limits: {
      fields: 3,
      files: 1,
      fileSize: 10000000
    }
  })

  upload.single('image')(req, res, async error => {
    try {
      if (error) throw error

      const section = req.body
      const { _id, name } = section
      const file = req.file

      if (!_id) throw new Error('Se requiere el ID del producto a actualizar')
      const withoutFields = Object.entries(section).length < 2
      if (withoutFields && !file) throw new Error('No se recibió ningún campo')

      const oldSection = await Section.findById(_id)
      if (oldSection === null) {
        throw new Error(`No se encontró la sección con id: ${_id}`)
      }

      for (const field in section) {
        if (field === '_id') continue
        let error
        const unexpected = oldSection[field] === undefined
        const unchanged = section[field] === oldSection[field]

        if (unexpected) error = `Campo ${field} inesperado`
        if (unchanged) error = 'Se ha recibido un campo sin cambios'
        if (error) throw new Error(error)
      }

      if (name) {
        const alreadyExists = await Section.findOne({ name }).lean()
        if (alreadyExists) throw new Error(`La sección (${name}) ya existe`)
      }

      const oldName = oldSection.name
      const oldImage = oldSection.image

      if (file) section.image = await updateBlob('sections/', file, oldImage)

      const dbRes = await Section.updateOne({ _id }, section)
      queryUpdateSuccess({ dbRes, target: `la sección ${oldName}`, _id })
      await Product.updateMany({ section: oldName }, { section: name })

      return res.json({ message: 'Sección actualizada' })
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  })
}

const deleteSection = async (req, res) => {
  const deleting = {
    count: 0,
    section: null,
    db: false,
    blob: false,
    haveProducts: null,
    productsMatched: [],
    products: { count: 0, product: null, db: false, blob: false }
  }

  try {
    const resetDeletingProduct = () => {
      deleting.products.product = null
      deleting.products.db = false
      deleting.products.blob = false
    }

    const resetDeleting = () => {
      deleting.section = null
      deleting.db = false
      deleting.blob = false
      deleting.haveProducts = null
      deleting.productsMatched = []
      resetDeletingProduct()
    }

    const getSection = async toDelete => {
      const { _id } = toDelete
      if (!_id) throw new Error('Se requiere el ID de la sección a eliminar')

      const section = await Section.findById(_id).lean()
      if (section === null) {
        throw new Error(`No se encontró la sección con ID: ${_id}`)
      }

      const { name } = section
      const productsMatched = await Product.find({ section: name })
        .select('id name image')
        .lean()

      deleting.haveProducts = productsMatched.length > 0
      deleting.productsMatched = productsMatched
      return section
    }

    const runDelete = async section => {
      const { _id, name, image } = section
      deleting.section = section
      deleting.products.count = 0

      const productsMatched = deleting.productsMatched
      if (productsMatched.length > 0) {
        for (const product of productsMatched) {
          resetDeletingProduct()
          deleting.products.product = product
          const { _id, image } = product

          const dbRes = await Product.deleteOne({ _id })
          queryDeleteSuccess({ dbRes, _id, target: `el producto ${name}` })
          deleting.products.db = true

          await deleteBlob(image)
          deleting.products.blob = true
          deleting.products.count++
        }

        delete deleting.products.db
        delete deleting.products.blob
        delete deleting.products.product
        deleting.products.success = true
      }

      const dbRes = await Section.deleteOne({ _id })
      queryDeleteSuccess({ dbRes, target: `la sección ${name}`, _id })
      deleting.db = true

      await deleteBlob(image)
      deleting.blob = true
    }

    if (Array.isArray(req.body)) {
      const sectionsToDelete = req.body
      if (sectionsToDelete.length < 2) {
        throw new Error('Se requiere al menos dos secciones a eliminar')
      }

      for (const toDelete of sectionsToDelete) {
        resetDeleting()
        const section = await getSection(toDelete)
        await runDelete(section)
        deleting.count++
      }

      return res.json({ message: `${deleting.count} secciones eliminadas` })
    }

    const section = await getSection(req.body)
    await runDelete(section)

    return res.json({ message: `Sección (${section.name}) eliminada` })
  } catch (error) {
    if (deleting.haveProducts === false) delete deleting.products
    if (deleting.productsMatched.length === 0) delete deleting.productsMatched
    const resBody = { error: error.message, deleting }

    if (deleting.db === true) {
      resBody.reset = { action: 'Recuperar sección en db' }
      try {
        const section = new Section(deleting.section)
        await section.save()
        resBody.reset.succes = true
      } catch (errorRecoveringInDB) {
        resBody.reset.succes = false
        resBody.reset.error = errorRecoveringInDB.message
      }
    }

    return res.status(400).json(resBody)
  }
}

module.exports = {
  addSection,
  updateSection,
  deleteSection
}
