const mongoose = require('mongoose')
//const uniqueValidator = require('mongoose-unique-validator')

const postSchema = new mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number
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