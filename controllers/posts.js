const postsRouter = require('express').Router()
const Post = require('../models/post')

postsRouter.get('/', (_request, response) => {
  Post.find({}).then(persons => {
    response.json(persons.map(person => person.toJSON()))
  })
})

postsRouter.post('/', (request, response) => {
  const newPost = new Post(request.body)

  newPost.save()
    .then(result => {
      response.status(201).json(result)
    })
})

module.exports = postsRouter