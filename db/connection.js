const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const dbClient = mongoose
  .connect(process.env.DB_AUTH)
  .then(m => {
    const auth = process.env.DB_AUTH
    const dbName = auth.split('.net/')[1].split('?')[0]
    console.log(`🔥BBDD "${dbName}" conectada🔥`)
    return m.connection.getClient()
  })
  .catch(err =>
    console.log('Ocurrio un error al conectarse a la base de datos: ' + err)
  )

module.exports = dbClient
