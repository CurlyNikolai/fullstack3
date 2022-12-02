const { application } = require('express')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
const Blog = require('../models/blog')
const helper = require('../utils/test_helper')

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
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

  await api
    .post('/api/blogs')
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

  await api
    .post('/api/blogs')
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
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  })
  
  test('blog url missing', async () => {
    const newBlog = {
      title: 'No URL Blog Title',
      author: 'No URL Blog Author',
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  })
  
  test('blog title and url missing', async () => {
    const newBlog = {
      author: 'No URL Blog Author',
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  })
})

test('get specific blog with id', async () => {
  const initialBlogs = await helper.blogsInDb()

  const queriedBlog = initialBlogs[0]

  const resultBlog = await api
    .get(`/api/blogs/${queriedBlog.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const processedQueriedBlog = JSON.parse(JSON.stringify(queriedBlog))

  expect(resultBlog.body).toEqual(processedQueriedBlog)
})

test ('delete specific blog', async () => {
  const initialBlogs = await helper.blogsInDb()

  const blogToDelete = initialBlogs[0]
  
  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const updatedBlogs = await helper.blogsInDb()
  expect(updatedBlogs).toHaveLength(helper.initialBlogs.length - 1)
})

afterAll(() => {
  mongoose.connection.close()
})