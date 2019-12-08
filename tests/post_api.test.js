const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Post = require('../models/post')
const User = require('../models/user')
const api = supertest(app)
const helper = require('./post_api_test_helper')
const usersHelper = require('./user_api_test_helper')

/**
 * Initialize test database. 
 * 1. Create a two users.
 * 2. Create posts belonging to the first user of the list
 */

beforeEach(async () => {

  await Post.deleteMany({})
  await User.deleteMany({})

  await User.createUser(helper.initialUsers[0])
  await User.createUser(helper.initialUsers[1])
  
  const users = await usersHelper.getUsers()

  const posts = helper.initialPosts.map(post => {
    post.user = users[0].id
    return post
  })

  await Post.insertMany(posts)

})

describe('with initial data in the DB', () => {

  test('posts are returned as json', async () => {
    await api
      .get('/api/posts')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('posts have a field called id instead of __id', async () => {
    const posts = await helper.getPosts()
    posts.forEach(post => expect(post.id).toBeDefined())
    posts.forEach(post => expect(post.__id).toBe(undefined))
  })

  test('all notes are returned', async () => {
    const response = await api.get('/api/posts')
    expect(response.body.length).toBe(helper.initialPosts.length)
  })

  test('a specific author is within posts', async () => {
    const response = await api.get('/api/posts')

    const authors = response.body.map(post => post.author)

    expect(authors).toContain('Tumppu2')
  })

  test('the first note is about HTTP methods', async () => {
    const response = await api.get('/api/posts')
    expect(response.body[0].title).toBe('HTML is easy')
  })

  describe('add new post', () => {
    test('new post can be added for a specific user with valid token', async () => {

      //login user!
      const user = helper.initialUsers[0]
      const authString = await login(user.username, user.password)

      const title = 'async/await simplifies making async calls'

      const newPost = {
        title: title,
        author: 'Tumppu3',
        url: 'zzz',
        likes: 0,
        userId: user.id
      }

      await api
        .post('/api/posts')
        .send(newPost)
        .set({ Authorization: authString })
        .expect(201) //201 created
        .expect('Content-Type', /application\/json/)


      const response = await api.get('/api/posts')

      const titles = response.body.map(post => post.title)

      expect(response.body.length).toBe(helper.initialPosts.length + 1)
      expect(titles).toContain(
        title
      )
    })

    test('a new post cannot be added with invalid token', async () => {
      const title = 'async/await simplifies making async calls'

      const postsInitially = await helper.getPosts()

      const newPost = {
        title: title,
        author: 'Tumppu3',
        url: 'zzz',
        likes: 0,
        userId: 'xxx'
      }

      await api
        .post('/api/posts')
        .send(newPost)
        .set({ Authorization: 'bearer xxxxxxxxxx12234' })
        .expect(401) //401 unauthorized
        .expect('Content-Type', /application\/json/)

      const postsAfter = await helper.getPosts()

      expect(postsInitially.length).toBe(postsAfter.length)

    })

    test('a new post cannot be added with missing token', async () => {
      const title = 'async/await simplifies making async calls'

      const postsInitially = await helper.getPosts()

      const newPost = {
        title: title,
        author: 'Tumppu3',
        url: 'zzz',
        likes: 0,
        userId: 'xxx'
      }

      await api
        .post('/api/posts')
        .send(newPost)
        .expect(401) //401 unauthorized
        .expect('Content-Type', /application\/json/)

      const postsAfter = await helper.getPosts()

      expect(postsInitially.length).toBe(postsAfter.length)

    })

    test('a new post with not all required fields cannot be added', async () => {

      const user = helper.initialUsers[0]
      const authString = await login(user.username, user.password)

      const newPost = {
        title: 'This is a title'
      }

      await api
        .post('/api/posts')
        .send(newPost)
        .set({ Authorization: authString })
        .expect(400) //bad request

      const posts = await helper.getPosts()

      expect(posts.length).toBe(helper.initialPosts.length)
    })

    test('a new post with value for likes not provided will get 0 likes by default', async () => {

      const newPostObj = new Post({
        title: 'This is a title',
        author: 'User',
      })

      const result = await newPostObj.save()

      expect(result.likes).toBe(0)

    })
  })

  describe('update post', () => {

    test('update works with valid authorization tokeni', async () => {

      const posts = await helper.getPosts()
      const post = posts[0]
      const user = helper.initialUsers[0]
      const authString = await login(user.username, user.password)

      const updatedPost = {
        ...post,
        likes: post.likes + 1
      }

      const url = `/api/posts/${post.id}`

      const result = await api
        .put(url)
        .set({ Authorization: authString })
        .send(updatedPost)
        .expect(200)

      expect(result.body.likes).toBe(post.likes + 1)
    })

    test('update failes when user tries to update a post belonging to other user', async () => {

      const posts = await helper.getPosts()
      const post = posts[0]
      const user = helper.initialUsers[1]
      const authString = await login(user.username, user.password)

      const updatedPost = {
        ...post,
        likes: post.likes + 1
      }

      const url = `/api/posts/${post.id}`

      await api
        .put(url)
        .set({ Authorization: authString })
        .send(updatedPost)
        .expect(401) //unauthorized

    })

    test('updating existing post with empty body should not change the entry', async () => {
      const posts = await helper.getPosts()
      const post = posts[0]
      const user = helper.initialUsers[0]
      const authString = await login(user.username, user.password)
      const url = `/api/posts/${post.id}`

      const result = await api
        .put(url)
        .set({ Authorization: authString })
        .send({})
        .expect(200)
      
      expect(result.body.title).toBe(post.title)
      expect(result.body.author).toBe(post.author)
      expect(result.body.likes).toBe(post.likes)
      expect(result.body.url).toBe(post.url)

    })

    test('update item not found should return 404', async () => {
      const user = helper.initialUsers[0]
      const authString = await login(user.username, user.password)

      const id = await helper.nonExistingId()
      await api
        .put(`/api/posts/${id}`)
        .set({ Authorization: authString })
        .send()
        .expect(404)
    })

    test('update item with malformmatted id should return 400', async () => {
      const user = helper.initialUsers[0]
      const authString = await login(user.username, user.password)

      await api
        .put('/api/posts/xxx')
        .set({ Authorization: authString })
        .send({ title: 'this is a title', author: 'some author' })
        .expect(400)
    })

  })

  describe('delete post', () => {

    test('deleting post with no token failes', async () =>{
      const posts = await helper.getPosts()
      

      await api
        .delete(`/api/posts/${posts[0].id}`)
        .send()
        .expect(401)
    })

    test('delete existing post when post belongs to user and user is logged in', async () => {

      let posts = await helper.getPosts()
      const user = helper.initialUsers[0]
      const authString = await login(user.username, user.password)

      const nofPosts = posts.length
      const firstPost = posts[0]

      await api
        .delete(`/api/posts/${firstPost.id}`)
        .set({ Authorization: authString })
        .send()
        .expect(200)

      posts = await helper.getPosts()
      const nofPostsAfterDelete = posts.length

      expect(nofPostsAfterDelete).toBe(nofPosts - 1)

    })

    test('delete existing post when post belongs to another user', async () => {

      let posts = await helper.getPosts()
      const user = helper.initialUsers[1]
      const authString = await login(user.username, user.password)

      const nofPosts = posts.length
      const firstPost = posts[0]

      await api
        .delete(`/api/posts/${firstPost.id}`)
        .set({ Authorization: authString })
        .send()
        .expect(401)

      posts = await helper.getPosts()
      const nofPostsAfterDelete = posts.length

      expect(nofPostsAfterDelete).toBe(nofPosts)

    })

    test('delete nonexisting post with properly formatted id (should return 200)', async () => {
      const user = helper.initialUsers[0]
      const authString = await login(user.username, user.password)
      
      const id = await helper.nonExistingId()
      await api
        .delete(`/api/posts/${id}`)
        .set({ Authorization: authString })
        .send()
        .expect(200)
    })

    test('delete post with malformatted id (should return 400: bad request )', async () => {
      const user = helper.initialUsers[0]
      const authString = await login(user.username, user.password)

      await api
        .delete('/api/posts/xxx')
        .set({ Authorization: authString })
        .send()
        .expect(400)
    })

  })

})

afterAll(() => {
  mongoose.connection.close()
})

/**
 * Helper method to login user
 */
const login = async (username, password) => {
  
  const loginRequest = {
    username, password
  }

  const loginResult = await api
    .post('/api/login')
    .send(loginRequest)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  return `Bearer ${loginResult.body.token}`

} 