require('dotenv/config.js');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const debug = require('debug')('dev:start');
const homeRouter = require('../routes/home.js');
const genresRouter = require('../routes/genres.js');
const customerRouter = require('../routes/customers.js');
const movieRouter = require('../routes/movies.js');
const rentalRouter = require('../routes/rental.js');
const userRouter = require('../routes/user.js');
const errorRouter = require('../routes/error.js');
const exceptionHandler = require('./exception.js');


const pipeline = (app) => {

  // middlewares
  app.use(express.json());
  app.use(helmet());
  if (process.env.NODE_ENV === 'development') {
    debug('Routes logging enabled . . .');
    app.use(morgan('common'));
  }

  // routes
  app.use('/', homeRouter);
  app.use('/api/genres', genresRouter);
  app.use('/api/customers', customerRouter);
  app.use('/api/movies', movieRouter);
  app.use('/api/rentals', rentalRouter);
  app.use('/api/users', userRouter);

  // exception handler
  app.use(exceptionHandler);

  // invalid routes
  app.use('/*', errorRouter);

}

module.exports = pipeline;