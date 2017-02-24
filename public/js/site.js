$.noConflict();
jQuery(function($) {
  $(document).ready(function() {
    function getWeather(loc) {
      if(loc.lat!=='' && loc.lng!=='') {
        $.when($.ajax({
          type: 'GET',
          url: '/weather/'+loc.lat+','+loc.lng
        })).then(function(data) {
          var current = data.currently;
          var curTemp = current.temperature;
          console.log(curTemp);
        }, failure);
      }
    }

    function getCoordinates(address, callback) {
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
    }

    $('#w-form').on('submit', function(e) {
      var address = ($('#w-text').val());
      getCoordinates(address, getWeather);
      e.preventDefault();
    });
  });

  function failure() {
    console.log('Error');
  }
});