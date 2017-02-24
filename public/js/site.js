//TODO Create a error function to handle any errors
$.noConflict();
(function($) {
  $(document).ready(function() {

    var getWeatherInfo = function(lat,lng, callback) {
      $.when($.ajax({
        type: 'GET',
        url: 'https://api.darksky.net/forecast/10ec48a74229fb3f53027bee3f2bfb2b/'+lat+','+lng+
          '?exclude=minutely,hourly,flags'
      })).then(callback, function() {
        console.log("Error");
      });
    };

    var getWeather = function(loc) {
      if(loc.lat!=='' && loc.lng!=='') {
        getWeatherInfo(loc.lat, loc.lng, function(data) {
          var current = data.currently;
          var curTemp = current.temperature;
          console.log(curTemp);
        });
      }
    };

    var getCoordinates = function(callback) {
      var address = ($('#w-text').val());
      if(address.length > 0) {
        $.when($.ajax({
          type: 'GET',
          url: '/coordinates/'+address
        })).then(function(data) {
          if(data.status === "OK") {
            var loc = data.results[0].geometry.location;
            callback(loc);
          }
        }, function() {
          console.log("Error");
        });
      }
    };

    $('#w-form').on('submit', function(e) {
      getCoordinates(getWeather);
      e.preventDefault();
    });


  });
})(jQuery);