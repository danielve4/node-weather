$.noConflict();
jQuery(function($) {
  var monthNames = [
    "January", "February", "March","April", "May", "June", "July",
    "August", "September", "October", "November", "December"];
  var historyActive=false; //Keep track if history card is open
  var storageItem = 'pastQueries'; //Name of item in localStorage
  var todayDate;
  var pastQueries; //Stores the localStorage string for pastQueries
  $(document).ready(function() {
    function addWeatherCards(weatherData) { //Function to add all weather info to page
      $('#weather-data').empty();
      var today = formattedDay(); //Get JSON info of today's date
      var current = weatherData.current; //Stores current information about the weather
      var past = weatherData.past.days; //Stores weather info about previous days
      //Following arrays will be passed to graphing library
      var pastDays= [];
      var pastMax = [];
      var pastMin = [];

      $('#weather-data').append( //Adds the weather information and structure
        '<li class="card">'+
          '<ul id="current">'+
            '<li id="location-found">'+
              weatherData.location + //Place Google Maps API assumed address to be
            '</li>' +
            '<li id="current-date">'+
               today.month + ' ' + today.day + //Today's date
            '</li>' +
            '<li id="current-temperature">'+
              Math.round(current.currently.temperature) + '° F' + //Current temperature
            '</li>' +
            '<li>' +
              'Currently: '+current.currently.summary + //Summary of current weather
            '</li>'+
            '<li id="current-high-low">' + //High and low of current day
              'Low: '+Math.round(current.currently.low)+'° High: '+Math.round(current.currently.high)+'°'+
            '</li>'+
          '</ul>'+
        '</li>'+
        '<li class="card">'+
          '<h2>Next 5 Days</h2>' + //Forecast for next 5 days
          '<ul id="forecast">'+
          '</ul>'+
        '</li>'+
        '<li class="card">' +
          '<h2>Forecast Visualized</h2>' + //Graph of past five days
          '<ul id="forecast-chart">' +
            '<li class="ct-chart ct-perfect-fourth" id="forecast-graph"></li>' +
          '</ul>' +
        '</li>' +
        '<li class="card">' +
          '<h2>Previous 3 Days</h2>' + //Graph of past days
          '<ul id="past-days-chart">' +
            '<li class="ct-chart ct-perfect-fourth" id="past-days-graph"></li>' +
          '</ul>' +
        '</li>'
      );
      //Adds list of days with their high and lows to page
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
        if(i<past.length) { //Populating the data to feed graph of past days
          pastDays.push(past[i].day);
          pastMax.push(past[i].temperatureMax);
          pastMin.push(past[i].temperatureMin);
        }
      }
      var chartOptions = { //Options for the graph
        fullWidth: true,
        axisY: {
          onlyInteger: true,
          position: 'end'
        }
      };
      var forecastChart = { //Graph for the high and low of next 5 days
        labels: current.forecastChart.days,
        series: [
          current.forecastChart.temperatureMax,
          current.forecastChart.temperatureMin
        ]
      };
      //Add graph to page
      new Chartist.Line('#forecast-graph', forecastChart, chartOptions);

      var pastDaysChart = { //Graph of high and low of past days
        labels: pastDays,
        series: [
          pastMax,
          pastMin
        ]
      };
      //Add graph to page
      new Chartist.Line('#past-days-graph', pastDaysChart, chartOptions);
    }

    function showNoResults(error) { //Shows error messages below the search box
      $('#error-message').empty();
      if(error.length>0) {
        $('#error-message').append(error);
      } else {
        $('#error-message').append('Unknown error occurred');
      }
    }

    function getWeather(address, callback) { //HTTP GET request to get weather data
      todayDate = Math.floor(Date.now() / 1000);
      var pastDaysToQuery = 3; //How many days prior to query for weather
      $.when($.ajax({
        type: 'GET',
        url: '/weather/'+address+','+pastDaysToQuery+','+todayDate
      })).then(function(data) {
        if(data.status === "OK") { //Location was found
          addToHistory(data.location);
          callback(data);
        } else { //No location was found
          showNoResults(data.status);
        }
      }, showNoResults);
    }

    $('#w-form').on('submit', function(e) { //Listener for when form is submitted
      var address = ($('#w-search').val()); //Get the text from search box
      if(address.length > 0) { //Only proceed if there is text in search box
        $('#error-message').empty(); //Erase any error messages if any are displayed
        getWeather(address, function (data) {
          addWeatherCards(data); //Pass weather info to add to page
        });
      } else {
        showNoResults('Please enter a location'); //Error message for when user submits empty form
      }
      e.preventDefault();
    });


    $('#w-search').focus(function() { //Adds a yes class to search box to see if it is in focus
      $(this).addClass('yes');
    }).blur( function() {
      $(this).removeClass('yes');
    });

    $('#history-button').on('click', function(e) { //Listening for history button to be pressed
      if(!historyActive) { //Only prceed if history is not open/displayed
        var historyList = getHistory().queries; //Get history from localStorage
        //Adds active classes so these can be displayed on the page
        $('#history-card').addClass('card');
        $('#history-card').addClass('active');
        $('.history-close-button').addClass('active');
        $('.close-button-li').addClass('active');
        if(historyList.length>0) { //Check if no prior history
          $('#history-list').addClass('active');
          for(var p=0;p<historyList.length;p++) { //Add past queries to history card
            $('#history-list').append(
              '<li class="list-card-history"><a href="#" class="history-element">'+historyList[p]+'</a></li>'
            );
          }
        } else { //Say history is empty in history box
          $('#history-list').append(
            '<li>History is empty</li>'
          );
        }
        historyActive=true; //True means history card is open
      }
    });
    //If user clicks on any past queries, close history card and perform search
    $('#history-list').on('click', '.history-element', function() {
      $('.history-close-button').click();
      $('#w-search').val($(this).text());
      $('#w-search').submit();
    });
    //If user wants to close the history card
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
  //Gets item from localStorage, if not set or invalid, create new JSON format
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
    return pastQueriesJSON; //Return JSON object of past queries
  }
  //Adds lcoation to history only iff not already in the history list
  function addToHistory(location) {
    var newQueries;
    var maxHistorySize=5;
    var exists=false; //Check if location already exist in history list
    newQueries = getHistory();
    for(var u=0;u<newQueries.queries.length;u++) {
      if(location===newQueries.queries[u]) {
        exists=true;
      }
    }
    if(!exists) { //Location does not exist
      if(newQueries.queries.length>=maxHistorySize) {
        newQueries.queries.shift();
      }
      newQueries.queries.push(location);
      localStorage.setItem(storageItem, JSON.stringify(newQueries));
    }
  }
  //Return JSON format of today's day with day, month, and time
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

