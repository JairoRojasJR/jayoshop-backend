const { BlobServiceClient } = require('@azure/storage-blob')
const { nanoid } = require('nanoid')

const getContainerClient = () => {
  const AZ_ST_AUTH = process.env.AZURE_STORAGE_CONNECTION_STRING
  const containerName = process.env.AZURE_BLOB_CONTAINER

  if (!AZ_ST_AUTH) {
    throw Error('Azure Storage Connection string not found')
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(AZ_ST_AUTH)
  return blobServiceClient.getContainerClient(`${containerName}/images`)
}

const createBlobName = (path, fullFileName) => {
  const fileNameSplit = fullFileName.split('.')

  const fileName = fileNameSplit[0]
  const blobNameId = '--id--' + nanoid(5)
  const fileExtension = fileNameSplit[1]

  return `${path}${fileName}${blobNameId}.${fileExtension}`
}

const uploadBlob = async (blobName, buffer) => {
  const containerClient = getContainerClient()
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)
  await blockBlobClient.upload(buffer, buffer.length)
}

const updateBlob = async (path, file, oldFile) => {
  const containerClient = getContainerClient()
  const blobName = createBlobName(path, file.originalname)

  const blockBlobClient = containerClient.getBlockBlobClient(blobName)
  const blockBlobClientOld = containerClient.getBlockBlobClient(oldFile)

  await blockBlobClientOld.delete({ deleteSnapshots: 'include' })

  const buffer = file.buffer
  await blockBlobClient.upload(buffer, buffer.length)

  return blobName
}

const deleteBlob = async blobName => {
  const containerClient = getContainerClient()
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)
  return await blockBlobClient.delete({ deleteSnapshots: 'include' })
}

module.exports = {
  getContainerClient,
  createBlobName,
  uploadBlob,
  updateBlob,
  deleteBlob
}
