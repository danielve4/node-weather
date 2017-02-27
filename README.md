#Weather Application
This application uses Express to handle GET requests for weather in any location. Here I use Google's Geocoding API 
to retrieve a location's coordinates given the user input. I then use these coordinates to make GET requests to the 
Dark Sky API. I request for the current weather as well as the weather for the past three days.

It is all presented in a card UI that follows some of Google's Material Design guidelines.
 
#Usage
It is very straightforward to use. Just type in the search box for an address, zip code, or city name and the site 
will display weather information of that place.