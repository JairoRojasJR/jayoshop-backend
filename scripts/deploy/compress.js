const fs = require('node:fs')
const archiver = require('archiver')

const sourceDirectory = process.argv[2]
const zipFileName = process.argv[3]

const output = fs.createWriteStream(zipFileName)
const archive = archiver('zip', {
  zlib: { level: 9 }
})

output.on('close', () => {
  console.log('✅ Archivos comprimidos con éxito.')
})

archive.on('warning', err => {
  if (err.code === 'ENOENT') {
    console.warn(err)
  } else {
    throw err
  }
})

archive.on('error', err => {
  throw err
})

// Comprimir la carpeta "temp" y su contenido
archive.pipe(output)
archive.directory(sourceDirectory, false) // El segundo argumento "false" evita que se incluya la carpeta raíz en el archivo ZIP
archive.finalize()
