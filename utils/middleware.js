const morgan = require('morgan')

const morganCustom = morgan((tokens, req, res) => {
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

module.exports = {
  morganCustom
}