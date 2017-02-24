$.noConflict();
(function($) {
  $(document).ready(function() {

    let getWeatherInfo = function(lat,lng, callback) {
      $.when($.ajax({
        type: 'GET',
        url: 'https://api.darksky.net/forecast/10ec48a74229fb3f53027bee3f2bfb2b/'+lat+','+lng+
          '?exclude=minutely,hourly,flags'
      })).then(callback, function() {
        console.log("Error");
      });
    };

    let getWeather = function(loc) {
      if(loc.lat!=='' && loc.lng!=='') {
        getWeatherInfo(loc.lat, loc.lng, function(data) {
          let current = data.currently;
          let curTemp = current.temperature;
          console.log(curTemp);
        });
      }
    };

    let getAddressInfo = function(address, callback) {
      $.when($.ajax({
        type: 'GET',
        url: 'https://maps.googleapis.com/maps/api/geocode/json?address='+address+
        '&key=AIzaSyBumPhCSIrrBtwTIbeZZ5mdW7tNa_s5FXA'
      })).then(callback, function() {
        console.log("Error");
      });
    };

    let getCoordinates = function(callback) {
      let address = ($('#w-text').val());
      if(address.length > 0) {
        getAddressInfo(address, function(data) {
          if(data.status === "OK") {
            let loc = data.results[0].geometry.location;
            callback(loc);
          }
        });
      }
    };

    $('#w-form').on('submit', function(e) {
      getCoordinates(getWeather);

      e.preventDefault();
    });


  });
})(jQuery);