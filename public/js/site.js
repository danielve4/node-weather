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
  var storageItem = 'pastQueries';
  var todayDate;
  var pastQueries;
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

        if(i<past.length) {
          pastDays.push(past[i].day);
          pastMax.push(past[i].temperatureMax);
          pastMin.push(past[i].temperatureMin);
        }
      }

      var chartOptions = {
        fullWidth: true,
        axisY: {
          onlyInteger: true,
          position: 'end'
        }
      };

      var forecastChart = {
        labels: current.forecastChart.days,
        series: [
          current.forecastChart.temperatureMax,
          current.forecastChart.temperatureMin
        ]
      };
      new Chartist.Line('#forecast-graph', forecastChart, chartOptions);

      var pastDaysChart = {
        labels: pastDays,
        series: [
          pastMax,
          pastMin
        ]
      };
      new Chartist.Line('#past-days-graph', pastDaysChart, chartOptions);
    }

    function getWeather(address, callback) {
      todayDate = Math.floor(Date.now() / 1000);
      var days = 3;
      $.when($.ajax({
        type: 'GET',
        url: '/weather/'+address+','+days+','+todayDate
      })).then(function(data) {
        addToHistory(address);
        callback(data);
      }, failure);
    }

    $('#w-form').on('submit', function(e) {
      var address = ($('#w-search').val());
      if(address.length > 0) {
        addToHistory(address);
        getWeather(address, function (data) {
          addCurrentWeatherChart(data);
        })
      }
      e.preventDefault();
    });


    $('#w-search').focus(function() {
      $(this).addClass('yes');
    }).blur( function() {
      $(this).removeClass('yes');
    });

  });

  function getHistory() {
    var pastQueriesJSON;
    pastQueries = localStorage.getItem(storageItem);
    if(!pastQueries) {
      pastQueriesJSON = {
        'queries': []
      };
    } else {
      pastQueriesJSON = JSON.parse(pastQueries);
    }
    return pastQueriesJSON;
  }

  function addToHistory(location) {
    var newQueries;
    pastQueries = getHistory();
    if(newQueries.queries.length>=5) {
      newQueries.queries.shift();
    }
    newQueries.queries.push(location);
    localStorage.setItem(storageItem, JSON.stringify(newQueries));

  }

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