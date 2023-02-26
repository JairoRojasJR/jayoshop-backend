const { getContainerClient } = require('../services/stream');

const getImage = async (req, res) => {
  let containerClient;
  try {
    containerClient = getContainerClient();
  } catch (error) {
    return res.status(400).json({ error: 'Conexión con el Storage fallida' });
  }

  const imageId = req.params.id;
  const extension = imageId?.split('.')[1];

  res.header('content-type', 'image/' + extension);
  res.set('accept-ranges', 'bytes');

  try {
    const blockBlobClient = containerClient.getBlockBlobClient(imageId);

    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    const readableStream = downloadBlockBlobResponse.readableStreamBody;

    readableStream.on('data', chunck => res.write(chunck));
    readableStream.on('error', () =>
      res.status(400).json({ error: 'Fallo la obtención de la imagen' })
    );
    readableStream.on('end', () => res.end());
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = { getImage };
