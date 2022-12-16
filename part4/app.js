const config = require('./utils/config')
const express = require('express')
const app = express()
app.use(express.json())
const cors = require('cors')
const blogs = require('./controllers/blogs')
const users = require('./controllers/users')
const login = require('./controllers/login')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

logger.info(`connecting to`, config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)

app.use(cors())

app.use('/api/blogs', blogs.blogsRouter)
app.use('/api/users', users.usersRouter)
app.use('/api/login', login.loginRouter)

const errorHandler = (error, request, response, next) => {
  
  if (process.env.NODE_ENV !== 'test') console.log(error.message)

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    })
  }

  next(error)
}
app.use(errorHandler)

module.exports = app