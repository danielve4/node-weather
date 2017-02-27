var https = require('https');
var express = require('express')
    ,router = express.Router();

var weekDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var weatherKey = '10ec48a74229fb3f53027bee3f2bfb2b';
var mapsKey = 'AIzaSyBumPhCSIrrBtwTIbeZZ5mdW7tNa_s5FXA';
var allWeatherJSON = {
  'location':'',
  'current':'',
  'past':'',
};

router.get('/:address,:numDays,:from', function(request, response) {
  var address = request.params.address;
  var numOfDays = request.params.numDays;
  var startFrom = request.params.from;
  getCoordinates(address, function(data) {
    if(data.status === "OK") {
      var loc = data.results[0].geometry.location;
      if (loc.lat !== '' && loc.lng !== '') {
        getAllWeather(loc.lat, loc.lng, numOfDays, startFrom, function(allData) {
          allData.past.days.sort(function(a, b) {
            return parseFloat(a.time) - parseFloat(b.time);
          });
          allWeatherJSON.location = data.results[0].formatted_address;
          response.send(allData);
        });
      }
    } else {
      response.status(404).send('Location Not Found');
    }
  });
});

function getAllWeather(lat, lng, numDays, from, callback) {
  var numCompleted = 0;

  getCurrentWeather(lat, lng, function(current) {
    allWeatherJSON.current = current;
    numCompleted++;
    if(numCompleted===2) {
      callback(allWeatherJSON);
    }
  });
  getPastWeather(lat, lng, numDays, from, function(past) {
    allWeatherJSON.past = past;
    numCompleted++;
    if(numCompleted===2) {
      callback(allWeatherJSON);
    }
  });

}

function getPastWeather(lat, lng, numDays, from, callback) {
  var dayInSeconds = 24*60*60;
  var weatherQuery;
  var numCompleted = 0;
  var weatherForDays = {
    'days':[]
  };

  for(var j=1;j<=numDays;j++) {
    weatherQuery = 'https://api.darksky.net/forecast/'+weatherKey+'/'+
      lat+','+lng+','+(from-(dayInSeconds*j))+'?exclude=currently,hourly,flags';
    httpget(weatherQuery, function (data) {
      weatherForDays.days.push(pastDayJSON(data));
      numCompleted++;
      if(numCompleted==numDays) {
        callback(weatherForDays);
      }
    });
  }
}

function getCurrentWeather(lat, lng, callback) {
  var weatherQuery = 'https://api.darksky.net/forecast/'+weatherKey+'/'+
    lat+','+lng+'?exclude=minutely,hourly,flags';
  httpget(weatherQuery, function (data) {
    callback(currentJSON(data));
  });
}

function getCoordinates(address, callback) {
  var addressQuery = 'https://maps.googleapis.com/maps/api/geocode/json?address='+address+
    '&key='+mapsKey;
  httpget(addressQuery, callback);
}

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

function currentJSON(jsonData) {
  var now = jsonData.currently;
  var daily = jsonData.daily;
  var convertedDay;
  var current = {
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
    'forecastChart': {
      'days':[],
      'temperatureMax':[],
      'temperatureMin': []
    }
  };
  for(var i=1;i<daily.data.length-2;i++) {
    convertedDay = new Date(daily.data[i].time * 1000).getDay();
    current.nextDays.daily.push({
      'day': weekDays[convertedDay],
      'temperatureMax':daily.data[i].temperatureMax,
      'temperatureMin':daily.data[i].temperatureMin,
      'summary':daily.data[i].summary,
      'precipType':daily.data[i].precipType,
      'precipProbability':daily.data[i].precipProbability
    });
    current.forecastChart.days.push(weekDays[convertedDay]);
    current.forecastChart.temperatureMax.push(daily.data[i].temperatureMax);
    current.forecastChart.temperatureMin.push(daily.data[i].temperatureMin);
  }
  return current;
}

function pastDayJSON(jsonData) {
  var dayFacts = jsonData.daily.data[0];
  var convertedDay = new Date(dayFacts.time * 1000).getDay();
  var pastDaysData = {
    'day': weekDays[convertedDay],
    'time':dayFacts.time,
    'summary': dayFacts.summary,
    'temperatureMin':dayFacts.temperatureMin,
    'temperatureMax':dayFacts.temperatureMax
  };
  return pastDaysData;
}

module.exports = router;
