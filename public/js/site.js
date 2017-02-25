$.noConflict();
jQuery(function($) {
  var weekDays = [
    'Sunday','Monday','Tueday',
    'Wednesday','Thursday','Friday','Saturday'
  ];
  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];
  var todayDate;
  $(document).ready(function() {
    function addCurrentWeatherChart(weatherData) {
      $('#weather-data').empty();
      console.log(weatherData);
      var today = formattedDay();
      var current = weatherData.current;
      var past = weatherData.past.days;
      var pastDays=[];
      var pastMax = [];
      var pastMin = [];

      $('#weather-data').append(
        '<li class="card">'+
          '<ul id="current">'+
            '<li id="current-date">'+
               today.month + ' ' + today.day +
            '</li>' +
            '<li id="current-temperature">'+
              Math.round(current.currently.temperature) + '° F' +
            '</li>' +
            '<li>' +
              'Currently: '+current.currently.summary +
            '</li>'+
          '</ul>'+
        '</li>'+
        '<li class="card">'+
          '<ul id="forecast">'+
          '</ul>'+
        '</li>'+
        '<li class="card">' +
          '<ul id="forecast-chart">' +
            '<li class="ct-chart ct-perfect-fourth" id="forecast-graph"></li>' +
          '</ul>' +
        '</li>' +
        '<li class="card">' +
          '<ul id="past-days-chart">' +
            '<li class="ct-chart ct-perfect-fourth" id="past-days-graph"></li>' +
          '</ul>' +
        '</li>'
      );

      for(var i=0;i<current.nextDays.daily.length;i++) {
        $('#forecast').append(
          '<li class="forecast-day ">' +
          current.nextDays.daily[i].day + ' ' +
          '<span class="forecast-high-low">' +
            Math.round(current.nextDays.daily[i].temperatureMax) + '°/' +
            Math.round(current.nextDays.daily[i].temperatureMin) + '°' +
          '</span>' +
          '</li>'
        );
      }

      for(var l=past.length-1;l>=0;l--) {
        pastDays[l]=(past[l].day);
        pastMax[l]=(past[l].temperatureMax);
        pastMin[l]=(past[l].temperatureMin);
      }

      var forecastChart = {
        labels: current.forecastChart.days,
        series: [
          current.forecastChart.temperatureMax,
          current.forecastChart.temperatureMin
        ]
      };
      new Chartist.Line('#forecast-graph', forecastChart);

      var pastDaysChart = {
        labels: pastDays,
        series: [
          pastMax,
          pastMin
        ]
      };
      new Chartist.Line('#past-days-graph', pastDaysChart);
    }

    function getWeather(address, callback) {
      todayDate = Math.floor(Date.now() / 1000);
      var days = 3;
      $.when($.ajax({
        type: 'GET',
        url: '/weather/'+address+','+days+','+todayDate
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

  function formattedDay() {
    var date = new Date(todayDate*1000);
    var day = date.getDate();
    var month = date.getMonth();
    var hourMinutes = date.getHours() +':'+ date.getMinutes();
    var dayFormat = {
      'day':day,
      'month':monthNames[month],
      'time':hourMinutes
    };

    return dayFormat;
  }

  function failure(error) {
    if(error.length>0) {
      console.log('Error: '+error);
    } else {
      console.log('Unknown error occurred');
    }
  }
});