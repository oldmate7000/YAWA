// server.js

// init project
var express = require('express');
var app = express();
var request = require('request')
require('dotenv').config()


// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + '/public/index.html');
});

app.get('/getweather', function(req, res) {
    request('https://api.openweathermap.org/data/2.5/forecast?lat=-33.9240479&lon=151.1880122&appid=2660e938622fb954aa1131b571b41e53', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // console.log(response)
      // console.log(JSON.parse(body))
      res.json(JSON.parse(body))
    }
  })
});
// listen for requests :)
var listener = app.listen(process.env.PORT||3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
