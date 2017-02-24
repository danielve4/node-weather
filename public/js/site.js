$.noConflict();
jQuery(function($) {
  $(document).ready(function() {
    var failure = function() {
      console.log('Error');
    };

    var getWeather = function(loc) {
      if(loc.lat!=='' && loc.lng!=='') {
        $.when($.ajax({
          type: 'GET',
          url: '/weather/'+loc.lat+','+loc.lng
        })).then(function(data) {
            var current = data.currently;
            var curTemp = current.temperature;
            console.log(curTemp)
        }, failure);
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
        }, failure);
      }
    };

    $('#w-form').on('submit', function(e) {
      getCoordinates(getWeather);
      e.preventDefault();
    });

  });
});