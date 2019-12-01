const bcryptjs = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response, next) => {
  try {
    
    let users = null
    const include = request.query.include ? request.query.include.split(',') : []
    
    if(include.includes('posts')){
      users = await User.find({}).populate('posts', {title: 1})
    } else {
      users = await User.find({})
    }

    response.json(users.map(user => user.toJSON()))
  } catch (error) {
    next(error)
  }
})

usersRouter.post('/', async (request, response, next) => {
  try {
    const body = request.body
    if(body.password.length < 3) return response.status(400).json({error: 'Password too short'}).end()
        
    const savedUser = await User.createUser(body.username, body.name, body.password)

    response.json(savedUser)
  } catch (exception) {
    next(exception)
  }
})

module.exports = usersRouter