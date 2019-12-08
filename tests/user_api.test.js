const User = require('../models/user')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./user_api_test_helper')

describe('when initially only one user in the db', () => {


  beforeEach(async () => {
    await User.deleteMany({})
    const user = new User({ username: 'root', name: 'Admin', password: 'swordfish' })
    await user.save()
  })

  test('creation succeeded with a new user', async () => {
    const usersInitially = await helper.getUsers()

    const user = { username: 'tumppu', name: 'TuomasV6', password: 'swordfish2' }

    await api
      .post('/api/users')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAfter = await helper.getUsers()
    expect(usersInitially.length).toBe(usersAfter.length - 1)

  })

  test('cannot create user with a dublicate username', async () => {

    const newUser = {
      username: 'root',
      name: 'Admin',
      password: 'salainen',
    }

    const usersInitially = await helper.getUsers()
    
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAfter = await helper.getUsers()
    expect(usersAfter.length).toBe(usersInitially.length)

  })
})

describe('creating a new user the user match requirements', () => {

  test('if password is too short, new user will not be created', async () => {
    await User.deleteMany({})

    const newUser = {
      username: 'root',
      name: 'Admin',
      password: 'a',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('too short')

    const usersAfter = await helper.getUsers()

    expect(usersAfter.length).toBe(0)
  })

})

afterAll(() => {
  mongoose.connection.close()
})