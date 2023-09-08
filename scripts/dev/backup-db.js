const { execSync } = require('child_process')

const mongoUriAuth = process.env.MONGO_URI_AUTH
const azureStorageLaveci = process.env.AZURE_STORAGE_LAVECI

try {
  execSync(
    `mongodump --uri="${mongoUriAuth}/laveci?retryWrites=true" && mongorestore --uri="${mongoUriAuth}/dev-laveci?retryWrites=true" --drop ./dump/laveci && az storage blob delete-batch --source dev-laveci --account-name laveci --pattern * --account-key ${azureStorageLaveci} && az storage blob copy start-batch --destination-container dev-laveci --destination-path / --source-container laveci --account-name laveci --account-key ${azureStorageLaveci}`,
    { stdio: 'inherit' }
  )
} catch (error) {
  console.error(error)
  process.exit(1)
}
