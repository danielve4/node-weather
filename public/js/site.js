//TODO Create a error function to handle any errors
$.noConflict();
(function($) {
  $(document).ready(function() {
    var getWeather = function(loc) {
      if(loc.lat!=='' && loc.lng!=='') {
        $.when($.ajax({
          type: 'GET',
          url: '/weather/'+loc.lat+','+loc.lng
        })).then(function(data) {
            var current = data.currently;
            var curTemp = current.temperature;
            console.log(curTemp)
        }, function() {
          console.log("Error");
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