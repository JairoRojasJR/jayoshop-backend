const mongoose = require('mongoose')

mongoose.set('strictQuery', false)
const dbName = process.env.DB_NAME
const uri = `${process.env.DB_AUTH}/${dbName}?${globalThis.DB_OPTIONS}`

const dbClient = mongoose
  .connect(uri)
  .then(m => {
    console.log(`🔥BBDD (${dbName}) conectada🔥`)
    return m.connection.getClient()
  })
  .catch(err =>
    console.log('Ocurrio un error al conectarse a la base de datos: ' + err)
  )

module.exports = dbClient
