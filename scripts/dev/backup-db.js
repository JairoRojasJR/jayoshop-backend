require('dotenv').config()
const { execSync } = require('child_process')

const dbAuth = process.env.DB_AUTH
const dbOrigin = process.argv[2]
const dbDestination = process.argv[3]
const dbOptions = 'retryWrites=true&w=majority'

if (process.argv.length === 2) throw new Error('Falta el origen y el destino')
if (process.argv.length === 3) throw new Error('Falta el destino')

const apparentlySameName = process.argv.length < 5

const azOrigin = apparentlySameName ? dbOrigin : process.env[4]
const azDestination = apparentlySameName ? dbDestination : process.env[5]
const azStorageName = process.env.AZ_STORAGE_NAME
const azStorageKey = process.env.AZ_STORAGE_KEY

const dump = `mongodump --uri="${dbAuth}/${dbOrigin}?${dbOptions}"`
const restore = `mongorestore --uri="${dbAuth}/${dbDestination}?${dbOptions}" --drop ./dump/${dbOrigin}`
const azDelete = `az storage blob delete-batch --source ${azDestination} --account-name ${azStorageName} --pattern * --account-key ${azStorageKey}`
const azCopy = `az storage blob copy start-batch --destination-container ${azDestination} --destination-path / --source-container ${azOrigin} --account-name ${azStorageName} --account-key ${azStorageKey}`

try {
  execSync(`${dump} && ${restore} && ${azDelete} && ${azCopy}`, {
    stdio: 'inherit'
  })
} catch (error) {
  console.error(error)
  process.exit(1)
}
