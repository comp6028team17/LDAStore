var express    = require('express');
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var app        = express();

// log requests to the console
app.use(morgan('dev'));

// configure body parser
app.use(bodyParser.urlencoded({ limit: '512mb', extended: true }));
app.use(bodyParser.json({limit: '512mb'}));

var port     = process.env.PORT || 8080;

//load routes
var router = require('./app/routes')(app);

//register routes on /api
app.use('/api', router);

app.listen(port);
console.log('Magic happens on port ' + port);
