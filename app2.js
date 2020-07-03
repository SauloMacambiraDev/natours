const express = require('express');
const app = express();
const fs = require('fs');
const printRequestInfo = require('./utils/requestsUtil');
const morgan = require('morgan');

// MIDDLEWARES
app.use(express.json());

// Adding a new middleware to the middleware stack from express
app.use((req, res, next) => {
  // Defining a middleware HERE
  console.log('Hello from the middleware');
  printRequestInfo(req);
  req.requestTime = new Date().toISOString();
  console.log(`Request datetime(UTC) = ${req.requestTime}`);

  //   If we didn't call the next() function, the request response cycle would be stuck at this point.
  //   it woudn't be able to move on, and would never send a response to the client
  //   so.. NEVER FORGET TO USE NEXT() FUNCTION IN MIDDLEWARES!
  next();
});

app.use(morgan('dev'));

// Top Level blocking level - only load once
let tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
);

// Route Handlers

// GET tours
const getAllTours = (req, res) => {
  console.log(req.requestTime);

  res.status(200).json({
    status: 'Success',
    requestedAt: req.requestTime,
    result: tours.length,
    data: {
      tours: JSON.stringify(tours)
    }
  });
};

// DELETE tour
const deleteTour = (req, res) => {
  const { id } = req.params;

  if (id * 1 > tours.length) {
    res.status(404).json({
      status: 'Failure',
      message: 'Invalid ID'
    });
  }
  // Some logic here to remove the tour passed through the query string (req.params)
  res.status(204).json({
    status: 'success',
    data: null
  });
};

// Tour PATCH
const updateTour = (req, res) => {
  const id = req.params.id * 1;
  const { difficulty } = req.body;

  for (let i = 0; i < tours.length; i++) {
    if (tours[i].id === id) {
      tours[i].difficulty = difficulty;
      break;
    }
  }

  const tour = tours.find(el => el.id === id);

  if (!tour) {
    res.status(404).json({
      status: 'failure',
      message: 'Tour not found. Invalid ID to update Tour'
    });
  } else {
    fs.writeFile(
      `${__dirname}/dev-data/data/tours-simple.json`,
      JSON.stringify(tours),
      err => {
        if (err) {
          res.status(500).json({
            status: 'failure',
            message: `Error while trying to update tour in json file. Reason: ${err}`
          });
        }

        res.status(200).json({
          status: 'success',
          data: {
            tour
          }
        });
      }
    );

    // end else
  }
};

// GET Tour (:id)
const getTour = (req, res) => {
  console.log(`Params from url: ${req.params}`);

  const id = req.params.id * 1; // will automatically convert that string to Number
  const tour = tours.find(el => el.id === id);

  // if (id > tours.length - 1) {
  if (!tour) {
    res.status(404).json({
      status: 'failure',
      message: 'Tour not found. Invalid ID!'
    });
  } else {
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour
      }
    });
  }
};

//Users Routes handling
const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'failure',
    requestedAt: req.requestTime,
    message: 'Resource Users not implemented yet'
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'failure',
    requestedAt: req.requestTime,
    message: 'Resource Users not implemented yet'
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'failure',
    requestedAt: req.requestTime,
    message: 'Resource Users not implemented yet'
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'failure',
    requestedAt: req.requestTime,
    message: 'Resource Users not implemented yet'
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'failure',
    requestedAt: req.requestTime,
    message: 'Resource Users not implemented yet'
  });
};

// POST Create Tour
const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;

  //   const newTour = Object.assign({ id: newId }, res.body);
  //   is returning only {id: 9} for some reason

  //   SPREAD operator - EC6 (works like a charm)
  const newTour = { id: newId, ...req.body };

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      if (err) {
        console.log(`Error has been found: ${err}`);
        res
          .status(500)
          .json({ status: 'failure', message: `Reason of the error: ${err}` });
      }

      // status code 201 - Created
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
    }
  );
};

// Old Routes coding
// app.get('api/v1/tours', getAllTours);
// app.post('api/v1/tours', createTour);
// app.delete('api/v1/tours/:id', deleteTour);
// app.patch('api/v1/tours/:id', updateTour);
// app.get('api/v1/tours/:id', getTour);

// New Routers coding
const tourRouter = express.Router();
const userRouter = express.Router();

tourRouter
  //   .route('/api/v1/tours')
  .route('/')
  .get(getAllTours)
  .post(createTour);

tourRouter
  //   .route('/api/v1/tours/:id')
  .route('/:id')
  .get(getTour)
  .delete(deleteTour)
  .patch(updateTour);

//   Users resource routes
userRouter
  //   .route('/api/v1/users')
  .route('/')
  .get(getAllUsers)
  .post(createUser);

userRouter
  //   .route('/api/v1/users/:id')
  .route('/:id')
  .get(getUser)
  .delete(deleteUser)
  .patch(updateUser);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

const port = 3000;
app.listen(port, () => {
  console.log(`Server runnning on port ${port}...`);
});
