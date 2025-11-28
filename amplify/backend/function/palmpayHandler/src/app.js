const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const billerRoutes = require('./routes/biller');
const easeIdRoutes = require('./routes/easeId');

// declare a new express app
const app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

app.use('/billers', billerRoutes);
app.use('/easeId', easeIdRoutes);

app.listen(3000, function () {
  console.log('App started');
});

module.exports = app;
