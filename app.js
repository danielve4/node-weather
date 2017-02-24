var express = require('express');
var https = require('https');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');

function httpget(query, callback) {
  https.get(query, function(res) {
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      body = JSON.parse(body);
      callback(body);
    });
    res.on('error', function (error) {
      callback('Error: ' + error.message);
    });
  });
}

function getCoordinates(address, callback) {
  var mapsKey = 'AIzaSyBumPhCSIrrBtwTIbeZZ5mdW7tNa_s5FXA';
  var addressQuery = 'https://maps.googleapis.com/maps/api/geocode/json?address='+address+
    '&key='+mapsKey;
  httpget(addressQuery, callback);
}

function getWeather(lat, lng, callback) {
  var weatherKey = '10ec48a74229fb3f53027bee3f2bfb2b';
  var weatherQuery = 'https://api.darksky.net/forecast/'+weatherKey+'/'+
    lat+','+lng+'?exclude=minutely,hourly,flags';
  httpget(weatherQuery, callback);
}

function generateJSONWeather(weatherJSON, callback) {
  var weekDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var now = weatherJSON.currently;
  var daily = weatherJSON.daily;
  var convertedDay;
  var weatherJSON = {
    'currently': {
      'summary': now.summary,
      'precipProbability': now.precipProbability,
      'precipType': now.precipType,
      'temperature': now.temperature,
      'apparentTemperature': now.apparentTemperature
    },
    'nextDays': {
      'summary': daily.summary,
      'daily': []
    },
    'chartData': {
      'days':[],
      'temperatureMax':[],
      'temperatureMin': []
    }
  };
  for(var i=0;i<daily.data.length-2;i++) {
    convertedDay = new Date(daily.data[i].time * 1000).getDay();
    weatherJSON.nextDays.daily.push({
      'day': weekDays[convertedDay],
      'temperatureMax':daily.data[i].temperatureMax,
      'temperatureMin':daily.data[i].temperatureMin,
      'summary':daily.data[i].summary,
      'precipType':daily.data[i].precipType,
      'precipProbability':daily.data[i].precipProbability
    });
    weatherJSON.chartData.days.push(weekDays[convertedDay]);
    weatherJSON.chartData.temperatureMax.push(daily.data[i].temperatureMax);
    weatherJSON.chartData.temperatureMin.push(daily.data[i].temperatureMin);
  }
  callback(weatherJSON);
}

app.get('/', function(request, response) {
  response.sendFile(__dirname+'/views/index.html');
});

app.get('/weather/:address',function (request, response) {
  var address = request.params.address;
  getCoordinates(address, function(data) {
    if(data.status === "OK") {
      var loc = data.results[0].geometry.location;
      if (loc.lat !== '' && loc.lng !== '') {
        getWeather(loc.lat, loc.lng, function(data) {
          generateJSONWeather(data, function (weatherJSON) {
            response.send(weatherJSON);
          })
        })
      }
    } else {
      response.status(404).send(data);
    }
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});