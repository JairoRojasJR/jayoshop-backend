const Product = require('../models/Product')
const Section = require('../models/Section')

const getProducts = async (req, res) => {
  try {
    const { segmentation } = req.params
    if (segmentation === 'mostPopulars') {
      const { max } = req.query
      if (!max) throw new Error('Se require el parámetro (max)')

      const mostPopulars = await Product.find({}).limit(max).lean()
      return res.json(mostPopulars)
    }

    const { section } = req.query

    if (!section || section === 'Todo') {
      const products = await Product.find({}).lean()
      return res.json(products)
    }

    const products = await Product.find({ section }).lean()
    return res.json(products)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}

const getSections = async (req, res) => {
  const sections = await Section.find({}).lean()
  return res.json(sections)
}

module.exports = {
  getSections,
  getProducts
}
