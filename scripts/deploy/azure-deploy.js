const { execSync } = require('child_process')

const webapp = process.argv[2]
const zipPath = process.argv[3]

const options = {
  'resource-group': 'Portafolio-Web',
  name: webapp,
  'src-path': zipPath,
  type: 'zip',
  async: true
}

let command = 'az webapp deploy '
for (const option in options) command += `--${option} ${options[option]} `

try {
  execSync(command, { stdio: 'inherit' })
  console.log('✅ Aplicación desplegada con éxito a Azure')
} catch (e) {
  console.log(e)
  process.exit(1)
}
