const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const Users = await User
    .find({})
    .populate('blogs', { url: 1, title: 1, author: 1, id: 1})
  response.json(Users)
})

usersRouter.delete('/:id', async (request, response, next) => {
  try {
    const deletedUser = await User.findByIdAndDelete(request.params.id)
    response.status(204).json(deletedUser)
  }
  catch(exception) {
    next(exception)
  }
})

usersRouter.post('/', async (request, response, next) => {
  const {username, name, password} = request.body
  
  const existingUser = await User.findOne({ username })
  if (existingUser) {
    return response.status(400).json({
      error: 'username must be unique'
    })
  }

  if (!password || password.length < 3) {
    return response.status(400).json({
      error: 'User validation failed' 
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash
  })

  try {
    const savedUser = await user.save()
    response.status(201).json(savedUser)
  }
  catch(exception) {
    next(exception)
  }
})

module.exports = {usersRouter}