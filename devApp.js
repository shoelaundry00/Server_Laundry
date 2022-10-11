const nodemon = require('nodemon')
const ngrok = require('ngrok')
const port = process.env.PORT || 3000

nodemon({
  script: 'app.js',
  ext: 'js',
})

let url = null

nodemon
  .on('start', async () => {
    console.log('app.js just started \n')
    console.log(`localhost: http://localhost:${port}/api \n`)

    if (!url) {
      url = await ngrok.connect({
        port: port,
        region: 'sa',
        authtoken: '2FNWqegNRRitIyzhlI2xrYI7A8g_2vCA9gjsvms8nrdD1YVNs',
      })
      console.log(`server: ${url}/api`)
    }
  })
  .on('quit', async () => {
    console.log('killing app.js')
    await ngrok.kill()
  })
