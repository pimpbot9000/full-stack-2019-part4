const config = require('./utils/config')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
const postsRouter = require('./controllers/posts')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const mongoose = require('mongoose')

logger.debug('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    logger.debug('connected to MongoDB')
  })
  .catch((error) => {
    logger.debug('error connection to MongoDB:', error.message)
  })

app.use(cors())
app.use(bodyParser.json())
app.use(middleware.morganCustom)
app.use(middleware.tokenExtractor)
app.use('/api/posts', postsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app