const config = require('./utils/config')
const middleware = require('./utils/middleware')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
const postsRouter = require('./controllers/posts')
const usersRouter = require('./controllers/users')
const mongoose = require('mongoose')

console.log('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

app.use(cors())
app.use(bodyParser.json())
app.use(middleware.morganCustom)
app.use('/api/posts', postsRouter)
app.use('/api/users', usersRouter)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app