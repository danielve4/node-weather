$.noConflict();
jQuery(function($) {
  var weekDays = [
    'Sunday','Monday','Tueday','Wednesday','Thursday','Friday','Saturday'];
  var monthNames = [
    "January", "February", "March","April", "May", "June", "July",
    "August", "September", "October", "November", "December"];
  var historyActive=false;
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
            '<li id="location-found">'+
              weatherData.location +
            '</li>' +
            '<li id="current-date">'+
               today.month + ' ' + today.day +
            '</li>' +
            '<li id="current-temperature">'+
              Math.round(current.currently.temperature) + '° F' +
            '</li>' +
            '<li>' +
              'Currently: '+current.currently.summary +
            '</li>'+
            '<li id="current-high-low">' +
              'Low: '+Math.round(current.currently.low)+'° High: '+Math.round(current.currently.high)+'°'+
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
          '<li class="list-card">' +
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

    function showNoResults(error) {
      $('#error-message').empty();
      if(error.length>0) {
        $('#error-message').append(error);
      } else {
        console.log('Unknown error occurred');
      }
    }

    function getWeather(address, callback) {
      todayDate = Math.floor(Date.now() / 1000);
      var days = 3;
      $.when($.ajax({
        type: 'GET',
        url: '/weather/'+address+','+days+','+todayDate
      })).then(function(data) {
        if(data.status === "OK") {
          addToHistory(address);
          callback(data);
        } else {
          showNoResults(data.status);
        }
      }, showNoResults);
    }

    $('#w-form').on('submit', function(e) {
      var address = ($('#w-search').val());
      if(address.length > 0) {
        $('#error-message').empty();
        getWeather(address, function (data) {
          addCurrentWeatherChart(data);
        })
      } else {
        showNoResults('Please enter a location');
      }
      e.preventDefault();
    });


    $('#w-search').focus(function() {
      $(this).addClass('yes');
    }).blur( function() {
      $(this).removeClass('yes');
    });

    $('#history-button').on('click', function(e) {
      if(!historyActive) {
        var historyList = getHistory().queries;
        $('#history-card').addClass('card');
        $('#history-card').addClass('active');
        $('.history-close-button').addClass('active');
        $('.close-button-li').addClass('active');
        if(historyList.length>0) {
          $('#history-list').addClass('active');
          for(var p=0;p<historyList.length;p++) {
            $('#history-list').append(
              '<li class="list-card-history"><a href="#" class="history-element">'+historyList[p]+'</a></li>'
            );
          }
        } else {
          $('#history-list').append(
            '<li>History is empty</li>'
          );
        }
        historyActive=true;
      }
    });

    $('#history-list').on('click', '.history-element', function() {
      $('.history-close-button').click();
      $('#w-search').val($(this).text());
      $('#w-search').submit();
    });

    $('.history-close-button').on('click', function(e) {
      $('#history-card').removeClass('card');
      $('#history-card').removeClass('active');
      $('.history-close-button').removeClass('active');
      $('.close-button-li').removeClass('active');
      $('#history-list').addClass('active');
      $('#history-list').empty();
      historyActive=false;
    });

  });

  function getHistory() {
    var pastQueriesJSON;
    pastQueries = localStorage.getItem(storageItem);
    try {
      pastQueriesJSON = JSON.parse(pastQueries);
      if (pastQueriesJSON && typeof pastQueriesJSON === "object") {
        return pastQueriesJSON;
      }
    }
    catch (e) {}
    pastQueriesJSON = {
      'queries': []
    };
    return pastQueriesJSON;
  }

  function addToHistory(location) {
    var newQueries;
    newQueries = getHistory();
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
});