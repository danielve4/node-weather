var express = require('express');
var https = require('https');
var weather = require('./controllers/weather.js');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');

app.get('/', function(request, response) {
  response.sendFile(__dirname+'/views/index.html');
});

app.use('/weather', weather);

//
// app.get('/past-days/:numDays,:from', function(resquest, response) {
//   var numPreviousDays = request.params.numDays;
//   var today = new Date(request.params.from*1000);
//   var dayInSeconds = 24*60*60;
//   var daysToQuery = [];
//   for(var j=1;j<=numPreviousDays;j++) {
//     daysToQuery.push(today-(dayInSeconds*j));
//   }
//
//
//
// });

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
