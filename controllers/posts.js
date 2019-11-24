const postsRouter = require('express').Router()
const Post = require('../models/post')

postsRouter.get('/', async (_request, response) => {
  const posts = await Post.find({})
  response.json(posts.map(person => person.toJSON()))
})

postsRouter.post('/', async (request, response, next) => {
  const newPost = new Post(request.body)

  try {
    const result = await newPost.save()
    response.status(201).json(result.toJSON)
  } catch (exception) {
    next(exception)
  }
})

postsRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const newPost = {
    title: body.title,
    author: body.author,
    url: body.url ? body.url : '',
    likes: body.likes ? body.likes : 0
  }

  try {
    const updatedPost = await Post.findByIdAndUpdate(request.params.id, newPost, { new: true })
    if (updatedPost) {
      response.json(updatedPost.toJSON())
    } else {
      response.status(404).end()
    }

  } catch (error) {
    next(error)
  }

})

postsRouter.get('/:id', (request, response, next) => {
  const id = request.params.id
  Post.findById(id)
    .then(post => {
      if (post) {
        response.json(post.toJSON())
      } else { // properly formatted id but entry not found
        response.status(404).end()
      }
    })
    .catch(error => next(error)) // malformatted id but entry not found
})

/*
Traditional way!

postsRouter.post('/', (request, response, next) => {
  const newPost = new Post(request.body)

  newPost.save()
    .then(result => {
      response.status(201).json(result)
    })
    .catch(error => next(error))
})
*/

module.exports = postsRouter