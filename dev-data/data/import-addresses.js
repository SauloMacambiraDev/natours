const dotenv = require('dotenv')
dotenv.config({ path: `${__dirname}/../../config.env` })

const fs = require('fs')
const mongoose = require('mongoose')
const axios = require('axios')

const Address = require('./../../models/addressModel')

const connectionString = process.env.DATABASE_STRING_CONN.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}).then(conn => {
  // console.log('Database connected successfully')
}).catch(err => {
  // console.log('Database failed connecting to database, reason:')
  // console.log(err)
})

const insertAddresses = async (req, res) => {
  // const jsonObject = fs.readFileSync(`${__dirname}/addresses.json`, 'utf-8')
  const URL = 'https://gist.githubusercontent.com/letanure/3012978/raw/36fc21d9e2fc45c078e0e0e07cce3c81965db8f9/estados-cidades.json'
  try {
    const jsonObject = await axios.get(URL)
    const addressObj = jsonObject.data


    const states = addressObj.estados
    const brazilCountry = 'Brazil'

    result = []

    // iterate in states
    states.forEach(state => {
      let stateName = state.nome
      let cidades = state.cidades
      cidades.forEach(cidade => {
        result.push({
          country: brazilCountry,
          city: cidade,
          state: stateName
        })
      })
    })

    // console.log(`Number of addresses to be inserted in database: ${result.length}`)
    await Address.create(result)
    // console.log(`${result.length} addresses were added in database`)
  } catch (err) {
    // console.log(err)
  } finally {
    process.exit()
  }
}

const deleteAddresses = async (req, res) => {
  try {
    const numAddresses = await Address.countDocuments()
    // console.log(`${numAddresses} to be deleted in database`)
    await Address.deleteMany()
    // console.log(`${numAddresses} addresses deleted successfully`)
  } catch (err) {
    // console.log(err)
  } finally {
    process.exit()
  }
}

if (process.argv[2] && process.argv[2] === '--import') {
  // console.log('Inserting addresses..')
  insertAddresses()
} else if (process.argv[2] && process.argv[2] === '--delete') {
  // console.log('Deleting addresses..')
  deleteAddresses()
}

// console.log('PROCESS ARGv LIST:')
// console.log(process.argv)
