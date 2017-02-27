var https = require('https');
var express = require('express')
    ,router = express.Router();

var weekDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
//Keys for API used
var weatherKey = '10ec48a74229fb3f53027bee3f2bfb2b';
var mapsKey = 'AIzaSyBumPhCSIrrBtwTIbeZZ5mdW7tNa_s5FXA';
//Format of JSON to be returned from get request
var allWeatherJSON = {
  'status':'',
  'location':'',
  'current':'',
  'past':'',
};
//Handle get request with address, number of days, and current date
router.get('/:address,:numDays,:from', function(request, response) {
  var address = request.params.address;
  var numOfDays = request.params.numDays;
  var startFrom = request.params.from;
  getCoordinates(address, function(data) { //Get coordinates from Google Maps
    if(data.status === "OK") { //Proceed only if api found coordinates for address
      var loc = data.results[0].geometry.location; //Store coordinates
      if (loc.lat !== '' && loc.lng !== '') { //Safety check for coordinates not empty
        //Get all weather data for current, forecast, and past days
        getAllWeather(loc.lat, loc.lng, numOfDays, startFrom, function(allData) {
          //Sort the past days in ascending order
          allData.past.days.sort(function(a, b) {
            return parseFloat(a.time) - parseFloat(b.time);
          });
          allWeatherJSON.status = data.status;
          allWeatherJSON.location = data.results[0].formatted_address;
          response.send(allData); //Send the JSON format of the weather data
        });
      }
    } else if(data.status === "ZERO_RESULTS") { //Maps API did not find location
      var errorJSON = {
        'status': 'Sorry, no results were found for ' + address
      };
      response.send(errorJSON);
    } else {
      response.status(404).send('Unknown Error'); //Error message if status is different
    }
  });
});
//Get all weather data
function getAllWeather(lat, lng, numDays, from, callback) {
  var numCompleted = 0; //Keep track of request completed
  getCurrentWeather(lat, lng, function(current) {
    allWeatherJSON.current = current; //Add current and forecast to JSON to be sent back
    numCompleted++;
    if(numCompleted===2) {
      callback(allWeatherJSON);
    }
  });
  getPastWeather(lat, lng, numDays, from, function(past) {
    allWeatherJSON.past = past;//Add weather info of past days to JSON to be sent back
    numCompleted++;
    if(numCompleted===2) {
      callback(allWeatherJSON);
    }
  });
}
//Gets weather data for past days
function getPastWeather(lat, lng, numDays, from, callback) {
  var dayInSeconds = 24*60*60; //One day in unix time
  var weatherQuery;
  var numCompleted = 0;
  var weatherForDays = {
    'days':[]
  };
  //Query several times for data
  for(var j=1;j<=numDays;j++) {
    weatherQuery = 'https://api.darksky.net/forecast/'+weatherKey+'/'+
      lat+','+lng+','+
      (from-(dayInSeconds*j))+ //Go back one day every time loop continues
      '?exclude=currently,hourly,flags';
    httpget(weatherQuery, function (data) { //Make the HTTP Request
      weatherForDays.days.push(pastDayJSON(data)); //Adds JSON of past formatted
      numCompleted++;
      if(numCompleted==numDays) {
        callback(weatherForDays);
      }
    });
  }
}
//Returns in callback the weather data for current and forecast
function getCurrentWeather(lat, lng, callback) {
  var weatherQuery = 'https://api.darksky.net/forecast/'+weatherKey+'/'+
    lat+','+lng+'?exclude=minutely,hourly,flags';
  httpget(weatherQuery, function (data) {
    callback(currentJSON(data));
  });
}
//Get coordinates from Google Maps API
function getCoordinates(address, callback) {
  var addressQuery = 'https://maps.googleapis.com/maps/api/geocode/json?address='+address+
    '&key='+mapsKey;
  httpget(addressQuery, callback);
}
//General function to make GET requests given query and callback, done asynchronous
function httpget(query, callback) {
  https.get(query, function(res) {
    var body = '';
    res.on('data', function(chunk) { //Add incoming data to body
      body += chunk;
    });
    res.on('end', function() { //Pass the data back once all is retrieved
      body = JSON.parse(body);
      callback(body);
    });
    res.on('error', function (error) {
      callback('Error: ' + error.message);
    });
  });
}
//Generates custom JSON format of current weather to be sent back
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
      'apparentTemperature': now.apparentTemperature,
      'high':daily.data[0].temperatureMax,
      'low': daily.data[0].temperatureMin
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
//Generates custom JSON format of past to be sent back
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
