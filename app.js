var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var knex = require('./db/knex');
var rp = require('request-promise');
require('dotenv').load();

function saveWine(wineObject) {
  knex('wines').insert({
    name: wineObject.name,
    grape: wineObject.grape,
    vineyard: wineObject.vineyard,
    vintage: wineObject.vintage,
    region: wineObject.region,
    price: wineObject.price,
    picture: wineObject.picture
  }).then(data => {
    knex('users_wines').insert({
      user_id: wineObject.user_id,
      wine_id:
    }).then(data2 => {
      res.status(200);
    });
  });
}

// var wineUrl = 'http://services.wine.com/api/beta2/service.svc/JSON//catalog?filter=categories(490+124)&offset=10&size=5&apikey=af9f483043f31e08bf6d87a187dd12b0';

// 'http://services.wine.com/api/beta2/service.svc/JSON//catalog?filter=categories(490+124)&offset=10&size=5&apikey='

// var routes = require('./routes/index');
// var users = require('./routes/users');

var app = express();
var apiKey = process.env.APIKEY;

// // view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/:codes', (req, res, next) => {
  var codes = req.params.codes;
  var price = req.params.codes.slice(0, 6);
  var priceRange = '';

  switch (price) {
    case 'price1':
      priceRange = '0|25';
      break;
    case 'price2':
      priceRange = '25|50';
      break;
    case 'price3':
      priceRange = '50|100';
      break;
    default:
      priceRange = '0|100';
      break;
  }

  var options = {
    method: 'GET',
    json: true,
    uri: 'http://services.wine.com/api/beta2/service.svc/JSON//catalog?filter=categories(' + codes + ')+price(' + priceRange + ')&apikey=' + apiKey
  }

  rp(options)
  .then(data => {
    var allWines = data.Products.List;
    var chosenWines = [];

    for (var i = 0; i < 3; i++) {
      var idx = Math.random() * allWines.length;

      chosenWines.push(allWines.splice(idx, 1))
    }

    res.send(chosenWines);
  });
});

app.post('/', (req, res, next) => {
  var wine = req.body;

  saveWine(wine);
});

// app.use('/', routes);
// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
