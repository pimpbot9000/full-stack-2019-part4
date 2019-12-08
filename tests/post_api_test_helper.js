const Post = require('../models/post')

const initialPosts = [
  {
    title: 'HTML is easy',
    author: 'Tumppu',
    url: 'xxx',
    likes: 12
  },
  {
    title: 'Browser can execute only Javascript',
    author: 'Tumppu2',
    url: 'yyy',
    likes: 5
  },
]

const initialUsers = [
  {
    username: 'root',
    name: 'admin',
    password: 'swordfish'
  }, 
  {
    username: 'the_other_guy',
    name: 'The Other Guy',
    password: 'password'
  }
]

const getPosts = async () => {
  const posts = await Post.find({})
  return posts.map(post => post.toJSON())
}

const nonExistingId = async () => {
  const note = new Post({ title: 'willremovethissoon', author: 'xxx', url: 'xxx', likes: 0})
  await note.save()
  await note.remove()

  return note._id.toString()
}

module.exports = {
  initialPosts,
  initialUsers,
  getPosts,
  nonExistingId
}