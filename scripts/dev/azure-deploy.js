const { execSync } = require('child_process')

const destination = process.argv[2]
const command = `az webapp deploy --resource-group Portafolio-Web --name ${destination} --src-path backend.zip --type zip --async true`

try {
  execSync(command, { stdio: 'inherit' })
} catch (e) {
  console.log(e)
  process.exit(1)
}
