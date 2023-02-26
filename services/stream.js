const { BlobServiceClient } = require('@azure/storage-blob');

const getContainerClient = () => {
  const AZ_ST_AUTH = process.env.AZURE_STORAGE_CONNECTION_STRING;

  if (!AZ_ST_AUTH) {
    throw Error('Azure Storage Connection string not found');
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(AZ_ST_AUTH);
  return blobServiceClient.getContainerClient('imagenes');
};

module.exports = { getContainerClient };
