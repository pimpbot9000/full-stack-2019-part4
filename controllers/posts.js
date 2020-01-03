const postsRouter = require('express').Router()
const Post = require('../models/post')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

postsRouter.get('/', async (request, response) => {

  let posts = null

  const include = request.query.include ? request.query.include.split(',') : []

  if (include.includes('user')) {
    posts = await Post.find({}).populate('user')
  } else {
    posts = await Post.find({}).populate('user', { username: 1 })
  }

  response.json(posts.map(post => post.toJSON()))
})

/**
 * Create new post. Requires authorization token.
 */
postsRouter.post('/', async (request, response, next) => {

  const body = request.body

  try {

    const result = await checkUser(request)

    if (!result.user) {
      return response.status(result.status).json({ error: result.error }).end()
    }

    const user = result.user

    const newPost = new Post({
      title: body.title,
      author: body.author ? body.author : user.name,
      url: body.url,
      user: user._id
    })


    const savedPost = await newPost.save()
    user.posts = user.posts.concat(savedPost._id)
    await user.save()

    const populatedPost = await Post
      .findOne({ _id: savedPost._id })
      .populate('user', { username: 1 })
    
    response.status(201).json(populatedPost.toJSON())

  } catch (exception) {
    next(exception)
  }
})

/**
 * Update a post belonging to user. Requires authorization token.
 * Order of checks:
 * 1. Is the user authenticated
 * 2. Does the post exist
 * 2. Does the post belong to the user
 * 
 * Expect: empty request body just updates the likes +1
 * No authorization required
 */
postsRouter.put('/:id', async (request, response, next) => {

  const newPost = request.body

  // check if user is authenticated
  const result = await checkUser(request)

  if (!result.user) {
    return response.status(result.status).json({ error: result.error }).end()
  }

  const user = result.user

  // check if request body is empty
  // if so, just update likes
  if (Object.getOwnPropertyNames(request.body).length === 0) {
    try {
      const post = await Post.findById(request.params.id)
      if (!post) return response.status(404).end()
      post.likes = post.likes + 1
      await post.save()
      return response.json(post.toJSON())
    } catch (error) {
      return next(error)
    }
  }

  // body not empty -> update other fields
  try {

    const post = await Post.findById(request.params.id)

    if (!post) return response.status(404).end()

    if (post.user.toString() === user._id.toString()) {

      post.title = newPost.title ? newPost.title : post.title
      post.url = newPost.url ? newPost.url : post.url
      post.likes = newPost.likes ? newPost.likes : post.likes
      await post.save()
      response.json(post.toJSON())

    } else {
      response.status(401).end()
    }

  } catch (error) {
    next(error)
  }

})

/**
 * Delete a post belonging to user. Requires authorization token.
 * Order of checks:
 * 1. Is the user authenticated
 * 2. Does the post exist
 * 2. Does the post belong to the user
 * 
 */
postsRouter.delete('/:id', async (request, response, next) => {
  const id = request.params.id

  const result = await checkUser(request)

  if (!result.user) {
    return response.status(result.status).json({ error: result.error }).end()
  }

  const user = result.user

  try {
    const post = await Post.findById(id)

    if (!post) return response.status(200).end()

    if (post.user.toString() === user._id.toString()) {

      await post.delete()
      response.status(200).end()

    } else {
      response.status(401).end()
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

/**
 * Helper method for checking authentication token and aquiring user
 * if valid token is provided
 * @param {request} request 
 */
const checkUser = async (request) => {

  if (!request.token) return {
    status: 401,
    error: 'token missing'
  }

  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!decodedToken.id) {
    return {
      status: 401,
      error: 'invalid token'
    }
  }

  const user = await User.findById(decodedToken.id)

  if (!user) {
    return {
      status: 400,
      error: 'user not found'
    }
  }

  return {
    user
  }
}

module.exports = postsRouter