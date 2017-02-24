var express = require('express');
var https = require('https');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');

var httpget = function(query, callback) {
  https.get(query, function(res) {
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });

    res.on('end', function() {
      body = JSON.parse(body);
      callback(body);
    });
    //TODO Add error checking
  });
};

app.get('/', function(request, response) {
  response.sendFile(__dirname+'/views/index.html');
});

app.get('/coordinates/:address', function(request, response) {
  var address = request.params.address;
  var mapsKey = 'AIzaSyBumPhCSIrrBtwTIbeZZ5mdW7tNa_s5FXA';
  var addressQuery = 'https://maps.googleapis.com/maps/api/geocode/json?address='+address+
    '&key='+mapsKey;
  httpget(addressQuery, function(data) {
    response.send(data);
  });
});

app.get('/weather/:lat,:lng', function(request, response){
  var lat = request.params.lat;
  var lng = request.params.lng;
  var weatherKey = '10ec48a74229fb3f53027bee3f2bfb2b';
  var weatherQuery = 'https://api.darksky.net/forecast/'+weatherKey+'/'+
    lat+','+lng+'?exclude=minutely,hourly,flags';
  httpget(weatherQuery, function(data) {
    response.send(data);
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});