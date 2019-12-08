const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const bcryptjs = require('bcryptjs')

const userSchema = mongoose.Schema({
  username: {
    type: String,
    minlength: 3,
    unique: true,
    require: true
  },
  name: {
    type: String,
    require: true
  },
  passwordHash: String,
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    }
  ],
})

userSchema.plugin(uniqueValidator)

userSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

User.createUser = async (user) => {

  const saltRounds = 10
  const passwordHash = await bcryptjs.hash(user.password, saltRounds)

  const userObj = new User({
    username: user.username,
    name: user.name,
    passwordHash,
  })

  return userObj.save()
}

module.exports = User