var SpotifyWebApi = require('spotify-web-api-node');

var express = require('express');
var app = express();

var bodyParser = require('body-parser'); // Required if we need to use HTTP query or post parameters

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true })); // Required if we need to use HTTP query or post parameters

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

//CORS
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });
var scopes = ['playlist-modify-public', 'user-top-read'],
    redirectUri = 'https://localhost:5000/callback',
    clientId = '582fe57ab3604c3fa3356b6ad0c7e446',
    state = 'SPACEBROWNS'

// clientId : '582fe57ab3604c3fa3356b6ad0c7e446',
// clientSecret : '3f04f5630aa04a889157d3cbccc8b1d3'

var spotifyApi = new SpotifyWebApi({
  redirectUri: redirectUri,
  clientId: clientId
});

var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

console.log(scopes);
console.log(authorizeURL);

app.get('/auth', function(request, response) {

  var access_token = '';
  // Retrieve an access token via authorization code workflow 
  console.log(scopes);
  console.log(authorizeURL);
  
});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});