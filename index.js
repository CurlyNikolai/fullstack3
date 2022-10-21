const express = require('express')
var morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')
const app = express()
app.use(express.json())
app.use(express.static('build'))
app.use(cors())
app.use(morgan(function (tokens, req, res) {
    
    var message = [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms'
    ].join(' ')

    if (req.method === 'POST') {
        message += ' ' + JSON.stringify(req.body)
    }

    return message
}))


app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    Person.count({})
        .then(count => {
        response.send(`<p>Phonebook has info for ${count} persons</p>
                       <p>${new Date()}</p>`)
        })
        .catch(error => {
            next(errorHandler)
        })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            }
            else {
                response.status(404).end()
            }
        })
        .catch(error => {
            next(error)
        })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error=> next(error))
})

app.post('/api/persons', (request, response) => {

    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }
    if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
    
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  
  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
        response.json(updatedPerson)
    })
    .catch(error => next(error))

})

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    }

    next(error)
}
app.use(errorHandler)



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})