const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('not enough arguments!\n'+
                'to display all persons: node mongo.js <passwd>\n'+
                'to add person: node.mongo.js <passwd> <name> <number>')
  process.exit()
}

// Define cmd-line arguments
const passwd = process.argv[2]
const newName = process.argv[3]
const newNumber = process.argv[4]

const url = `mongodb+srv://fullstack:${passwd}@cluster0.blc9sbg.mongodb.net/phonebook?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

mongoose.connect(url)
  .then(result => {
    console.log('connected')
  })
  .then(() => {
    // Add new person to phonebook
    if (newName && newNumber) {
      const person = new Person({
        name: newName,
        number: newNumber
      })
      return person.save().then(() => {
        console.log(`added ${newName} number ${newNumber} to phonebook`)
        return mongoose.connection.close()
      })
    }
    // If no name nor number is give, display existing persons
    if (!newName && !newNumber) {
      console.log('phonebook:')
      Person.find({}).then(result => {
        result.forEach(person => {
          console.log(person.name + ' ' + person.number)
        })
        return mongoose.connection.close()
      })
    }
  })
  .catch((err) => console.log(err))