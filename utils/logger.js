const config = require('dotenv').config()

const debug = (message) => {
  if(config.ENV === 'development'){
    console.log(message)
  }
}

module.exports = {
  debug
}