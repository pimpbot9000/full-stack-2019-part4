const morgan = require('morgan')

const morganCustom = morgan((tokens, req, res) => {

  if(process.env.NODE_ENV === 'test') return

  const method = tokens.method(req, res)

  if (method === 'POST' || method === 'GET' || method === 'DELETE') {
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
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json( {error: 'Invalid token'})
  }

  next(error)
}

const unknownEndpoint = (_request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const tokenExtractor = (request, _response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
  }
  next()
}

module.exports = {
  errorHandler,
  unknownEndpoint,
  morganCustom,
  tokenExtractor
}