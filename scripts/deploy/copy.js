const fs = require('node:fs')
const path = require('node:path')
const fsExtra = require('fs-extra')
const ignoreList = require('./ignoreList.json')

const origin = process.argv[2]
const destination = process.argv[3]

console.log(`🟣🚧 Copiando archivos en: ${destination}`)

function copyRecursive(source, destination) {
  if (ignoreList.includes(path.basename(source))) {
    console.log(`❕ Ignorando: ${path.basename(source)}`)
    return
  }

  if (fs.statSync(source).isDirectory()) {
    fsExtra.ensureDirSync(destination)

    const items = fs.readdirSync(source)
    items.forEach(item => {
      const sourcePath = path.join(source, item)
      const destinationPath = path.join(destination, item)
      copyRecursive(sourcePath, destinationPath)
    })
  } else {
    fsExtra.copyFileSync(source, destination)
    console.log(`🟣 Copiando: ${path.basename(source)}`)
  }
}

copyRecursive(origin, destination)
console.log('✅ Proceso de copia completado.')
