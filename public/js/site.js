$.noConflict();
jQuery(function($) {
  $(document).ready(function() {

    function addCurrentWeatherChart(weatherData) {
      console.log(weatherData);
      var chartTemp = {
        labels: weatherData.current.forecastChart.days,
        series: [
          weatherData.current.forecastChart.temperatureMax,
          weatherData.current.forecastChart.temperatureMin
        ]
      };
      new Chartist.Line('.ct-chart', chartTemp);
    }

    function getWeather(address, callback) {
      var from = Math.floor(Date.now() / 1000);
      console.log(from);
      var days = 3;
      $.when($.ajax({
        type: 'GET',
        url: '/weather/'+address+','+days+','+from
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