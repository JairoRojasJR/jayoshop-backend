const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const dbClient = mongoose
  .connect(process.env.DB_AUTH)
  .then(m => {
    console.log('BBDD conectada 😎');
    return m.connection.getClient();
  })
  .catch(err =>
    console.log('Ocurrio un error al conectarse a la base de datos: ' + err)
  );

module.exports = dbClient;
