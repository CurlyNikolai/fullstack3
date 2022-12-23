const { application } = require('express')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('../utils/test_helper')

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)

  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('testPsswd', 10)
  const user = new User({ username: 'testUser', passwordHash})
  await user.save()

})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('number of blogs match initial blogs', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('first blogger author matches', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body[0].author).toBe("Blogger 1")
})

test('blogs have unique identifier \'id\'', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body[0].id).toBeDefined()
  expect(response.body[response.body.length-1].id).toBeDefined()
})

test('blog can be added', async () => {
  const newBlog = {
    title: 'new blog',
    author: 'new author',
    url: 'new url',
    likes: 0
  }

  const login = await api
    .post('/api/login')
    .send({username: 'testUser', password: 'testPsswd'})
    .expect(200)
    .expect('Content-Type', /application\/json/)

  await api
    .post('/api/blogs')
    .set('Authorization', `bearer ${login.body.token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
    
  const response = await api.get('/api/blogs')
  
  const titles = response.body.map(blog => blog.title)

  expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
  expect(titles).toContain('new blog')
})

test('blog likes default to zero if undefined', async () => {
  const newBlog = {
    title: 'No Like Blog',
    author: 'No Like Author',
    url: 'no like url'
  }

  const login = await api
    .post('/api/login')
    .send({username: 'testUser', password: 'testPsswd'})
    .expect(200)
    .expect('Content-Type', /application\/json/)

  await api
    .post('/api/blogs')
    .set('Authorization', `bearer ${login.body.token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  
  const response = await api.get('/api/blogs')

  const likes = response.body.map(blog => blog.likes)
  expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
  expect(likes[likes.length - 1]).toBe(0)   

})


describe('gets 400 when', () => {
  test('blog title missing', async () => {
    const newBlog = {
      title: '',
      author: 'No Title Blog Author',
      url: 'no title blog url',
    }
  
    const login = await api
    .post('/api/login')
    .send({username: 'testUser', password: 'testPsswd'})
    .expect(200)
    .expect('Content-Type', /application\/json/)


    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${login.body.token}`)
      .send(newBlog)
      .expect(400)
  })
  
  test('blog url missing', async () => {
    const newBlog = {
      title: 'No URL Blog Title',
      author: 'No URL Blog Author',
    }

    const login = await api
    .post('/api/login')
    .send({username: 'testUser', password: 'testPsswd'})
    .expect(200)
    .expect('Content-Type', /application\/json/)
  
    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${login.body.token}`)
      .send(newBlog)
      .expect(400)
  })
  
  test('blog title and url missing', async () => {
    const newBlog = {
      author: 'No URL Blog Author',
    }
  
    const login = await api
    .post('/api/login')
    .send({username: 'testUser', password: 'testPsswd'})
    .expect(200)
    .expect('Content-Type', /application\/json/)

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${login.body.token}`)
      .send(newBlog)
      .expect(400)
  })
})

describe('with specific blog id', () => {
  test('get it', async () => {
    const initialBlogs = await helper.blogsInDb()
  
    const queriedBlog = initialBlogs[0]
  
    const resultBlog = await api
      .get(`/api/blogs/${queriedBlog.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    const processedQueriedBlog = JSON.parse(JSON.stringify(queriedBlog))
  
    expect(resultBlog.body).toEqual(processedQueriedBlog)
  })
  
  test ('delete it after adding it', async () => {
    const initialBlogs = await helper.blogsInDb()
  
    const newBlog = {
      title: 'new blog',
      author: 'new author',
      url: 'new url',
      likes: 0
    }

    const login = await api
      .post('/api/login')
      .send({username: 'testUser', password: 'testPsswd'})
      .expect(200)
      .expect('Content-Type', /application\/json/)

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${login.body.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    currentUsers = await helper.usersInDb()
    currentUser = currentUsers.find(u => u.username === 'testUser')
    
    blogToDeleteID = currentUser.blogs[currentUser.blogs.length - 1].toString()
    currentBlogs = await helper.blogsInDb()
    blogToDelete = currentBlogs.find(b => b.id === blogToDeleteID)

    await api
      .delete(`/api/blogs/${blogToDeleteID}`)
      .set('Authorization', `bearer ${login.body.token}`)
      .expect(204)
  
    const updatedBlogs = await helper.blogsInDb()
    expect(updatedBlogs).toHaveLength(initialBlogs.length)
    expect(updatedBlogs).not.toContain(blogToDelete.content)
  })
  
  test('update it', async () => {
    const initialBlogs = await helper.blogsInDb()
    
    const newBlog = {
      title: 'new blog',
      author: 'new author',
      url: 'new url',
      likes: 0
    }
    
    const login = await api
      .post('/api/login')
      .send({username: 'testUser', password: 'testPsswd'})
      .expect(200)
      .expect('Content-Type', /application\/json/)
    
    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${login.body.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
    currentUsers = await helper.usersInDb()
    currentUser = currentUsers.find(u => u.username === 'testUser')
    
    blogToUpdateID = currentUser.blogs[currentUser.blogs.length - 1].toString()
    currentBlogs = await helper.blogsInDb()
    blogToUpdate = currentBlogs.find(b => b.id === blogToUpdateID)
    
    const newLikes = blogToUpdate.likes + 5
  
    const blog = {
      title: blogToUpdate.title,
      author: blogToUpdate.author,
      url: blogToUpdate.url,
      likes: newLikes
    }
  
    login2 = await api
      .post('/api/login')
      .send({username: 'testUser', password: 'testPsswd'})
      .expect(200)
      .expect('Content-Type', /application\/json/)

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', `bearer ${login2.body.token}`)
      .send(blog)
      .expect(200)
  
    const updatedBlogs = await helper.blogsInDb()
    const updatedBlog = updatedBlogs.find(b => b.id === blogToUpdate.id)
    expect(updatedBlog.likes).toBe(blogToUpdate.likes + 5)
  })
})

afterAll(() => {
  mongoose.connection.close()
})