const config = require('./utils/config')
const express = require('express')
const app = express()
app.use(express.json())
const cors = require('cors')
const blogs = require('./controllers/blogs')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

logger.info(`connecting to`, config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)

app.use(cors())

app.use('/api/blogs', blogs.blogsRouter)
app.use(blogs.errorHandler)

module.exports = app