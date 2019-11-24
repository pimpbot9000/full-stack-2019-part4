const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Post = require('../models/post')
const api = supertest(app)
const helper = require('./post_api_test_helper')

/**
 * Create test database
 */
beforeEach(async () => {
  await Post.deleteMany({})
  await Post.insertMany(helper.initialPosts)
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
    test('new post can be added ', async () => {

      const title = 'async/await simplifies making async calls'

      const newPost = {
        title: title,
        author: 'Tumppu3',
        url: 'zzz',
        likes: 0
      }

      await api
        .post('/api/posts')
        .send(newPost)
        .expect(201) //201 == created
        .expect('Content-Type', /application\/json/)

      const response = await api.get('/api/posts')

      const titles = response.body.map(post => post.title)

      expect(response.body.length).toBe(helper.initialPosts.length + 1)
      expect(titles).toContain(
        title
      )
    })

    test('a new post with not all required fields cannot be added', async () => {
      const newPost = {
        title: 'This is a title'
      }

      await api
        .post('/api/posts')
        .send(newPost)
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

    test('correct update works', async () => {
      const posts = await helper.getPosts()
      const firstPost = posts[0]

      const updatedPost = {
        ...firstPost,        
        likes: firstPost.likes + 1
      }

      const url = `/api/posts/${firstPost.id}`

      const result = await api
        .put(url)
        .send(updatedPost)

      expect(result.body.likes).toBe(firstPost.likes + 1)
    })

    test('updating existing post with empty body should not change the entry', async () => {
      const posts = await helper.getPosts()
      const firstPost = posts[0]
      const url = `/api/posts/${firstPost.id}`

      const result = await api
        .put(url)
        .send({})
        .expect(200)
      
      expect(result.body).toEqual(firstPost)
    })

    test('update item not found should return 404', async () => {
      const id = await helper.nonExistingId()
      await api
        .put(`/api/posts/${id}`)
        .send()
        .expect(404)
    })

    test('update item with malformmatted id should return 400', async () => {
      await api
        .put('/api/posts/xxx')
        .send({title: 'this is a title', author: 'some author'})
        .expect(400)
    })

  })

  describe('delete post', () => {
    test('delete existing post', async () => {
      let posts = await helper.getPosts()
      const nofPosts = posts.length
      const firstPost = posts[0]
      
      await api
        .delete(`/api/posts/${firstPost.id}`)
        .send()
        .expect(200)   
      
      posts = await helper.getPosts()
      const nofPostsAfterDelete = posts.length

      expect(nofPostsAfterDelete).toBe(nofPosts - 1)

    })

    test('delete nonexisting post with properly formatted id (should return 200)', async () => {
      const id = await helper.nonExistingId()
      await api
        .delete(`/api/posts/${id}`)
        .send()
        .expect(200)
    })

    test('delete post with malformatted id (should return 400: bad request )', async () => {
      await api
        .delete('/api/posts/xxx')
        .send()
        .expect(400)
    })


  })

})

afterAll(() => {
  mongoose.connection.close()
})