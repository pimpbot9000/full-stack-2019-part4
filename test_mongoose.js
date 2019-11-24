/**
 * Test database connection
 */

const mongoose = require('mongoose')
const config = require('./utils/config')
const Post = require('./models/post')

const url = config.MONGODB_URI

mongoose.connect(url, { useNewUrlParser: true })

const newPost = new Post({
  title: 'HTML is Easy',
  author: 'tumppu',
  url: 'fkgjfg',
  likes: 123
})

newPost.save().then( () => {
  console.log('note saved!')
  mongoose.connection.close()
}).catch(error => console.log(error))