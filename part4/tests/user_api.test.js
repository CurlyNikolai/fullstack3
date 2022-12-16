const { application } = require('express')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require('../utils/test_helper')


describe('when there is initially on user in db', () => {

  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('hemlis', 10)
    const user = new User({ username: 'root', passwordHash})

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'curlyTest',
      name: 'Curly Name',
      password: 'curlySecret',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(user => user.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation with non-unique username fails', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Root Duplicate',
      password: 'DoubleSecret',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username must be unique')
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })
})

describe('creation fails when', () => {
  test('username length is less than 3', async () => {
    const newUser = {
      username: 'te',
      name: 'Short User',
      password: 'shortUser',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('User validation failed')
  })

  test('password length is less than 3', async () => {
    const newUser = {
      username: 'ShortUser',
      name: 'Short User',
      password: 'te',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

      expect(result.body.error).toEqual('User validation failed')

    result
  })

  test('username missing', async () => {
    const newUser = {
      name: 'Missing UserName',
      password: 'missingUserName',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('User validation failed')
  })

  test('password missing', async () => {
    const newUser = {
      username: 'MissingPassword',
      name: 'Missing UserName',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('User validation failed')
  })
})

afterAll(() => {
  mongoose.connection.close()
})
