const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/../../config.env` })

const fs = require('fs')
const Tour = require('./../../models/tourModel')
const Review = require('./../../models/reviewModel')
const User = require('./../../models/userModel')

const mongoose = require('mongoose');

const DB = process.env.DATABASE_STRING_CONN.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}).then(conn => {
  console.log('Remote database connection was established')
}).catch(err => {
  console.log(`Coundt make connection with the remote database. Reason:\n${err}`)
})

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf8'));
// const users = JSON.parse(fs.readFileSync(`${__dirname}/users-simple.json`, 'utf-8'));

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    // .create() method accepts an array of tours for each element in the array passed in
    await Tour.create(tours)
    console.log('Tour Data successfully loaded!')
    await User.create(users, { validateBeforeSave: false })
    console.log('User Data successfully loaded!')
    await Review.create(reviews)
    console.log('Review Data successfully loaded!')
    // await User.create(users)
    // console.log('User Data successfully loaded!')
  } catch (err) {
    console.log(err)
  }
  process.exit()
}

// DELETE ALL DATA FROM COLLECTION Tour and User IN DB
const deleteData = async () => {
  try {

    await Tour.deleteMany();
    console.log('Tour Data successfully deleted!')
    await User.deleteMany();
    console.log('User Data successfully deleted!')
    await Review.deleteMany();
    console.log('Review Data successfully deleted!')
  } catch (err) {
    console.log(err)
  }
  process.exit()
}

if (process.argv[2] && process.argv[2] === '--import') {
  importData()
} else if (process.argv[2] && process.argv[2] === '--delete') {
  deleteData()
}

console.log(process.argv)
