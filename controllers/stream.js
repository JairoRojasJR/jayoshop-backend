const { getContainerClient } = require('../services/stream')

const getImage = async (req, res) => {
  const imagePath = req.params[0]
  const imagePathSplit = imagePath.split('/')
  const extension = imagePathSplit[imagePathSplit.length - 1].split('.')[1]
  const contentType = `image/${extension === 'jpg' ? 'jpeg' : extension}`

  res.header('content-type', contentType)
  res.set('accept-ranges', 'bytes')

  try {
    const containerClient = getContainerClient()
    const blockBlobClient = containerClient.getBlockBlobClient(imagePath)

    const downloadBlockBlobResponse = await blockBlobClient.download(0)
    const readableStream = downloadBlockBlobResponse.readableStreamBody

    readableStream.on('data', chunck => res.write(chunck))
    readableStream.on('error', () => {
      res.header('content-type', 'application/json')
      res.status(400).json({ error: 'Fallo la obtención de la imagen' })
    })
    readableStream.on('end', () => res.end())
  } catch (error) {
    res.header('content-type', 'application/json')
    return res.status(400).json({ error: error.message })
  }
}

module.exports = { getImage }
