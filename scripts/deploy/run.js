const path = require('node:path')
const { execSync } = require('child_process')
const fsExtra = require('fs-extra')

const clean = () => {
  console.log('🗑 Eliminando los archivos residuales...')

  fsExtra.removeSync('temp')
  console.log('✅ Proceso de eliminación completado.')
}

try {
  const webapp = process.argv[2]
  if (!webapp) throw new Error('😥 Falta el nombre de la aplicación')

  console.log('🤞Copiando los archivos necesarios para la aplicación...')

  const origin = path.resolve('./')
  const destination = path.join(path.resolve('./'), 'temp', 'deploy')

  execSync(`node scripts/deploy/copy ${origin} ${destination}`, {
    stdio: 'inherit'
  })

  console.log('✨Comprimiendo los archivos en formato zip...')

  const zipFileName = 'temp/deploy.zip'

  execSync(`node scripts/deploy/compress ${destination} ${zipFileName}`, {
    stdio: 'inherit'
  })

  console.log('✨Desplegando aplicación a Azure🚀')

  execSync(`node scripts/deploy/azure-deploy ${webapp} ${zipFileName}`, {
    stdio: 'inherit'
  })

  console.log('👌Aplicación desplegada exitosamente🚀🚀🚀')
  clean()
} catch (e) {
  try {
    clean()
  } catch (e) {
    console.log(`No se pudo limpiar los archivos residuales: ${e}`)
  }

  console.log(e)
  process.exit(1)
}
