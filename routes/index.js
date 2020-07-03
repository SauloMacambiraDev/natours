const path = require('path')
const fs = require('fs')

module.exports = (app) => {
  fs.readdirSync(__dirname, "utf-8")
    .filter(file => {
      if (file.slice(-3) === '.js' && file !== 'index.js' && file.indexOf('.' !== 0)) {
        // console.log(file)
        return file
      }
    })
    .forEach(file => {
      require(path.resolve(__dirname, file))(app)
    })
}
