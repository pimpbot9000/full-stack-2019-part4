const morgan = require('morgan')

const morganCustom = morgan((tokens, req, res) => {

  if(process.env.NODE_ENV === 'test') return

  const method = tokens.method(req, res)

  if (method === 'POST' || method === 'GET') {
    const body = JSON.stringify(req.body)
    console.log([
      method,
      tokens.url(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      body]
      .join(' '))
  }
})

const errorHandler = (error, _request, response, next) => {

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

const unknownEndpoint = (_request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

module.exports = {
  errorHandler,
  unknownEndpoint,
  morganCustom
}