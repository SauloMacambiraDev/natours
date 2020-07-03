const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http');
const printRequestInfo = require('./utils/requestsUtil');

// MIDDLEWARE
app.use(express.json());

// app.post('', (req, res) => {
//   res.status(200).send('You can post to this endpoint');
// });

// app.get('/', (req, res) => {
//   //   res.status(200).send(`Sending data from server to Url ${req.url}`);
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side!', app: 'Natours' });
// });

// Top Level blocking level - only load once
let tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
);

app.delete('/api/v1/tours/:id', (req, res) => {
  const { id } = req.params;
  printRequestInfo(req);

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
});

// PATCH - update tour
app.patch('/api/v1/tours/:id', (req, res) => {
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
});

//GET - index - list tours
app.get('/api/v1/tours', (req, res) => {
  console.log(`Request coming from URL ${req.url}`);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

//GET - show/find(id) - tour
app.get('/api/v1/tours/:id', (req, res) => {
  console.log(`Params from url: ${req.params}`);
  printRequestInfo(req);

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
});

// GET - Create - tour
app.post('/api/v1/tours', (req, res) => {
  printRequestInfo(req);

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
});

//   res
//     .status(200)
//     .json({ status: 'success', message: 'Post worked correctly!' });

//   res.send('Done');

// same thing as...
// app.get('/api/v1/tours', (req, res) => {
//   console.log(`Request coming from URL ${req.url}`);
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tours: tours
//     }
//   });
// });

const port = 3000;
app.listen(port, () => {
  console.log(`Server runnning on port ${port}...`);
});

// and in the previous projects
// const server = http.createServer((req, res) => {
//   if (req.url == '/api/v1/tours') {
//     res.writeHead(200, { 'Content-Type': 'application/json' });
//     result = {
//       status: 'success',
//       data: {
//         tours: tours
//       }
//     };
//     res.end(result);
//   }
// });

// server.listen(3000, () => {
//   console.log(`Server listenning on port 3000...`);
// });
