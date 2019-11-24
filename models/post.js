const mongoose = require('mongoose')
//const uniqueValidator = require('mongoose-unique-validator')

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: false
  },
  likes: {
    type: Number,
    default: 0 //does not work with update and findOneAndUpdate
  }
})

postSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Post = mongoose.model('Post', postSchema)

module.exports = Post