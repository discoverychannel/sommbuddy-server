var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var rp = require('request-promise');

// var routes = require('./routes/index');
// var users = require('./routes/users');

var app = express();

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', routes);
// app.use('/users', users);

app.post('/', (req, res, next) {
  var type = req.body.type; //red, white, bubbles, etc.
  var wineFlavor = req.body.wineFlavor; //sweet, dry, exotic, etc.
  var profile = req.body.profile; //herbacious, piney, oakey, etc.
  var mealWeight = req.body.mealWeight; //light, heavy; entree, appetizers, dessert, etc.
  var foodFlavor = req.body.foodFlavor; //savory, sweet, etc.
  var price = req.body.price; //$, $$, $$$, etc.
  var options = {
    method = 'GET',
    uri: 'http://services.wine.com/api/beta2/service.svc/format/resource?apikey=key&parameters'
  }
})

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
