const User = require('../models/user')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const mongoose = require('mongoose')

const testUser = {
  username: 'root',
  name: 'admin',
  password: 'swordfish'
}
/**
 * Test initialization: Create user
 */
beforeEach(async () => {
  await User.deleteMany({})
  await User.createUser(testUser)
})


describe('with user already in database', () => {

  test('can login as user with correct password', async () => {

    const loginRequest = {
      username: testUser.username,
      password: testUser.password
    }

    await api
      .post('/api/login')
      .send(loginRequest)
      .expect(200)
      .expect('Content-Type', /application\/json/)

  })

  test('cannot login as user with incorrect password (returns 401)', async () => {

    const loginRequest = {
      username: 'root',
      password: 'swordfish123'
    }

    await api
      .post('/api/login')
      .send(loginRequest)
      .expect(401)
      .expect('Content-Type', /application\/json/)

  })

  test('cannot login as user if user does not exist (returns 401)', async () => {

    const loginRequest = {
      username: 'i do not exist',
      password: 'swordfish123'
    }

    await api
      .post('/api/login')
      .send(loginRequest)
      .expect(401)
      .expect('Content-Type', /application\/json/)

  })

})


afterAll(() => {
  mongoose.connection.close()
})