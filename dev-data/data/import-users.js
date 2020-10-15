const dotenv = require('dotenv')
dotenv.config({ path: `${__dirname}/../../config.env`})

const mongoose = require('mongoose')
const User = require('./../../models/userModel')
const fs = require('fs')

const strConn = process.env.DATABASE_STRING_CONN.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose.connect(strConn, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
})
.then(conn => {
  // console.log('Remote database successfully connected')
})
.catch(err => {
  // console.log(`Connection with database has failed. Reason:`)
  // console.log(err)
})

// In case we had fake user data or an administrador default user to be created by default
// const users = JSON.parse(fs.readFileSync('./users-simple.json', 'utf-8'))

const importUsers = async () => {
  try{

    // await User.create(users)
    // console.log('Users were created successfully')
    // console.log('Not implemented yet')
  }catch(err){
    // console.log(err)
  }
  // console.log('Closing execution..')
  process.exit()
}



const deleteAllUsers = async () => {
  try{

    await User.deleteMany()
    // console.log(`All users were successfully deleted!`)
  }catch(err){
    // console.log(`Coudn't delete all users. Reason:`)
    // console.log(err)
  }
  // console.log('Closing execution..')
  process.exit()
}

// console.log(process.argv[2])


if (process.argv[2] && process.argv[2] === '--import'){
  importUsers()
} else if (process.argv[2] && process.argv[2] === '--delete') {
  deleteAllUsers()
}

