$.noConflict();
jQuery(function($) {
  $(document).ready(function() {

    function addCurrentWeatherChart(weatherData) {
      var chartTemp = {
        labels: weatherData.chartData.days,
        series: [
          weatherData.chartData.temperatureMax,
          weatherData.chartData.temperatureMin
        ]
      };
      new Chartist.Line('.ct-chart', chartTemp);
    }

    function getWeather(address, callback) {
      $.when($.ajax({
        type: 'GET',
        url: '/weather/'+address
      })).then(function(data) {
        callback(data);
      }, failure);
    }

    $('#w-form').on('submit', function(e) {
      var address = ($('#w-search').val());
      if(address.length > 0) {
        getWeather(address, function (data) {
          addCurrentWeatherChart(data);
        })
      }
      e.preventDefault();
    });


    $('#w-search').focus( function() {
      $(this).addClass('yes');
    }).blur( function() {
      $(this).removeClass('yes');
    });

  });

  function failure(error) {
    if(error.length>0) {
      console.log('Error: '+error);
    } else {
      console.log('Unknown error occurred');
    }
  }
});