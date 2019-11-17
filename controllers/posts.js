const postsRouter = require('express').Router()
const Post = require('../models/post')

postsRouter.get('/', (_request, response) => {
    console.log('fetch all!!')
    Post.find({}).then(persons => {
        response.json(persons.map(person => person.toJSON()))
    })
})

postsRouter.post('/', (request, response) => {
    const blog = new Blog(request.body)
  
    blog
      .save()
      .then(result => {
        response.status(201).json(result)
      })
  })
  
module.exports = postsRouter