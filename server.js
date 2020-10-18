// Enviroment variables has to be defined befor instantiate app object
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app3.js');

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

// console.log(app.get('env'));
// console.log(process.env);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Listenning on port: ${port}`);
});

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION Shutting down...')
  // console.log(err)
  console.log(err.name, err.message)
  process.exit(1)
})

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION Shutting down...')
  // console.log(err)
  console.log(err.name, err.message) //err.name and err.message are default properties from Error in NodeJs

  // server.close() wait requests pending or processing end being processed to shutdown the server
  server.close(()=> {
    process.exit(1) // Shutdown immediately all request and connections
  })
});

/*
  SIGTERM is the signal from Heroku Plataform to indicate to the related Deno Container that
  host the natours application to shutdown in order to reduce maintaining cost into Heroku's Platform
  So, when a SIGTERM signal is sended from Heroku, we will handle the Event below
*/

process.on('SIGTERM', () => {
  console.log('SIGTERM RECEVEID, Shutting down gracefully');
  server.close(() => {
    // No need to use process.exit(1) since SIGTERM will shutdown the application automatically
    console.log('Process terminated!');
  })
})
