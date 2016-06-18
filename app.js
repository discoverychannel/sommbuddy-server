var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var knex = require('./db/knex');
var rp = require('request-promise');
var cors = require('cors');
require('dotenv').load();

// function saveWine(wineObject) {
//   knex('wines').insert({
//     name: wineObject.name,
//     grape: wineObject.grape,
//     vineyard: wineObject.vineyard,
//     vintage: wineObject.vintage,
//     region: wineObject.region,
//     price: wineObject.price,
//     picture: wineObject.picture
//   })
//   .then(data => {
//     // knex('users_wines').insert({
//     //   user_id: wineObject.user_id,
//     //   wine_id:
//     // }).then(data2 => {
//       return;
//     // });
//   });
// }

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

app.get('/favicon.ico', (req, res, next) => {
  res.status(200);
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.get('/list', (req, res, next) => {
  return knex('wines').select('name', 'vintage', 'price', 'picture')
    .then(data => {
      res.json(data);
    })
  })

app.post('/:user', (req, res, next) => {
  console.log(req.body);
  return knex('users').first().where({username: req.params.user}).then(function(data){
    console.log('this is inside the knex data');
    if(req.body.pw === data.password){
      console.log('user exists, there is a matched password!');
      res.json('match! show them their list.');
    } else {
      console.log('user found, no password!');
      res.json('user found, wrong password');
    }}).catch(function(err){
      console.log('knex threw an error!');
      res.json('user is not in db, redirect to register');
    })
  })

app.get('/:codes', (req, res, next) => {
  var codes = req.params.codes;
  var price = req.params.codes.slice(0, 6);
  var priceMin;
  var priceMax;

  switch (price) {
    case 'price1':
      priceMin = 0;
      priceMax = 25;
      break;
    case 'price2':
      priceMin = 25;
      priceMax = 50;
      break;
    case 'price3':
      priceMin = 50;
      priceMax = 100;
      break;
    default:
      priceMin = 0;
      priceMax = 100;
      break;
  }

  var options = {
    method: 'GET',
    json: true,
    uri: 'http://services.wine.com/api/beta2/service.svc/JSON//catalog?filter=categories(' + codes + ')+price(' + priceMin + '|' + priceMax + ')&apikey=' + apiKey
  }

  rp(options)
  .then(data => {
    var allWines = data.Products.List;
    var pricedWines = [];
    var chosenWines = [];
    var finalWines = [];

    allWines.forEach(function(wine) {
      if (wine.PriceRetail >= priceMin && wine.PriceRetail <= priceMax) {
        pricedWines.push(wine);
      }
    })

    for (var i = 0; i < 8; i++) {
      var idx = Math.random() * pricedWines.length;

      chosenWines.push(pricedWines.splice(idx, 1))
    }

    Promise.all(chosenWines.map(function(wine) {
      var options2 = {
        method: 'GET',
        uri: wine[0].Url,
        json: true
      }

      // console.log(options2.uri)

      return rp(options2).then(data => {
        var start = data.indexOf('<img alt="wine bottle" class="hero" itemprop="image" src=') + 57;
        var newData = data.slice(start, start + 300);
        var end = newData.indexOf('.jpg') + 5;
        var picture = newData.slice(0, end);

        wine[0].Picture = picture.slice(1,-1);

        // console.log(wine[0]);
      });
    })).then(function() {
      for (var j = 0; finalWines.length < 3; j++) {
        if (j == chosenWines.length - 1) break;
        if (chosenWines[j][0].Picture.length > 10) {
          finalWines.push(chosenWines[j])
        }
      }
      res.send(finalWines);
    });
    // console.log(chosenWines);
  });
});

app.post('/', (req, res, next) => {
  return knex('wines').insert({
    name: req.body.name,
    grape: req.body.grape,
    vineyard: req.body.vineyard,
    vintage: req.body.vintage,
    region: req.body.region,
    price: req.body.price,
    picture: req.body.picture,
    storeurl: req.body.storeUrl
  }).returning('id')
    .then(data => {
    res.json(data);
  });
});

app.put('/', (req, res, next) => {
  return knex('wines').where({name: req.body.name}).del()
    .then(data => {
      res.json(data);
  });
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
