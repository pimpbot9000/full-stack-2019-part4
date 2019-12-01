const postsRouter = require('express').Router()
const Post = require('../models/post')
const User = require('../models/user')

postsRouter.get('/', async (request, response) => {

  let posts = null

  const include = request.query.include ? request.query.include.split(',') : []

  if (include.includes('user')) {
    posts = await Post.find({}).populate('user')
  } else {
    posts = await Post.find({}).populate('user', {username: 1})
  }

  response.json(posts.map(post => post.toJSON()))
})

postsRouter.post('/', async (request, response, next) => {

  const body = request.body

  const user = await User.findById(body.userId)

  if (!user) {
    return response.status(400).json('user not found').end()
  }

  const newPost = new Post({
    title: body.title,
    author: body.author,
    url: body.url,
    user: user._id
  })

  try {
    const savedPost = await newPost.save()
    user.posts = user.posts.concat(savedPost._id)
    await user.save()
    response.status(201).json(savedPost.toJSON)
  } catch (exception) {
    next(exception)
  }
})

postsRouter.put('/:id', async (request, response, next) => {

  const newPost = request.body

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

postsRouter.delete('/:id', async (request, response, next) => {
  const id = request.params.id

  try {
    await Post.findByIdAndRemove(id)
    response.status(200).end()
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