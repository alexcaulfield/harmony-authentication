var SpotifyWebApi = require('spotify-web-api-node');
var express = require('express');
var app = express();
var bodyParser = require('body-parser'); // Required if we need to use HTTP query or post parameters

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Required if we need to use HTTP query or post parameters
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

//CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var scopes = ['playlist-modify-public', 'user-top-read'],
    redirectUri = 'http://localhost:5000/callback',
    clientId = '582fe57ab3604c3fa3356b6ad0c7e446',
    state = 'SPACEBROWNS';

// clientId : '582fe57ab3604c3fa3356b6ad0c7e446',
// clientSecret : '3f04f5630aa04a889157d3cbccc8b1d3'

var spotifyApi = new SpotifyWebApi({
  redirectUri: redirectUri,
  clientId: clientId,
  clientSecret : 'f6873873a0254442af4d6b5f54d57880'
});

// When our access token will expire
var tokenExpirationEpoch;

var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

app.get('/', function(request, response) {
  console.log('in get /')
  console.log(authorizeURL)

  // var access_token = '';

  // Retrieve an access token via authorization code workflow
  response.send(authorizeURL);

});

app.get('/callback', function(request, response){
  var code = request.query.code;
  var state = request.query.state;

  if (state === 'SPACEBROWNS'){

    spotifyApi.authorizationCodeGrant(code).then(function(data){

      console.log('The token expires in ' + data.body['expires_in']);
      console.log('The acccess token is ' + data.body['access_token']);
      console.log('The refresh token is ' + data.body['refresh_token']);

      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);

    // Save the amount of seconds until the access token expired
    tokenExpirationEpoch = (new Date().getTime() / 1000) + data.body['expires_in'];
    console.log('Retrieved token. It expires in ' + Math.floor(tokenExpirationEpoch - new Date().getTime() / 1000) + ' seconds!');

      response.redirect("/finished");

    }, function(err){
      response.send(err);
      console.log("Something went wrong", err);
    });
  } else {
    response.send("I didn't send you here... please leave");
  }
})

app.get('/finished', function(request, response) {

  spotifyApi.getMe().then(function(data){
    response.send(data.body);
  });

});

var artistId;
var relatedArtistsIds = [];
var playlistTrackUris = [];
var playlistId;

app.get('/findArtist', function(request, response) {
  spotifyApi.searchArtists('The Chainsmokers')
  .then(function(data) {
    artistId = data.body.artists.items[0].id;
    spotifyApi.createPlaylist('cauf', 'Test Playlist', { 'public' : true })
      .then(function(data) {
        console.log('Created playlist!');
        playlistId = data.body.id;
        spotifyApi.getArtistRelatedArtists(artistId)
          .then(function(data) {
            for (var i = 0; i < 5; i++) {
              relatedArtistsIds.push(data.body.artists[i].id);
            }
            for (var k = 0; k < 5; k++) {
              spotifyApi.getArtistTopTracks(relatedArtistsIds[k], 'US')
                .then(function(data) {
                  for (var j = 0; j < 5; j++) {
                    // console.log(data.body.tracks[j]);
                    playlistTrackUris.push(data.body.tracks[j].uri);
                  }
                  // response.send(data.body.tracks);
                }, function(err) {
                  console.log(err);
                });
            }
            // console.log('out of for loop and in RelatedArtists');
            // console.log(playlistTrackUris);
            spotifyApi.addTracksToPlaylist('cauf', playlistId, playlistTrackUris)
              .then(function(data) {
                console.log('Added tracks to playlist!');
              }, function(err) {
                console.log('Something went wrong!', err);
              });
          }, function(err) {
            console.log(err);
          });
      }, function(err) {
        console.log('Something went wrong!', err);
      });
  }, function(err) {
    console.error(err);
  });
});

var topTracks = function(artist) {
  spotifyApi.getArtistTopTracks(artist, 'US')
    .then(function(data) {
      for (var j = 0; j < 5; j++) {
        tracks.push(data.body.tracks[j].id);
      }
      // response.send(data.body);
    }, function(err) {
      console.log(err);
    });
}

var numberOfTimesUpdated = 0;

setInterval(function() {
  console.log('Time left: ' + Math.floor((tokenExpirationEpoch - new Date().getTime() / 1000)) + ' seconds left!');

  // OK, we need to refresh the token. Stop printing and refresh.
  if (++numberOfTimesUpdated > 5) {
    clearInterval(this);

    // Refresh token and print the new time to expiration.
    spotifyApi.refreshAccessToken()
      .then(function(data) {
        tokenExpirationEpoch = (new Date().getTime() / 1000) + data.body['expires_in'];
        console.log('Refreshed token. It now expires in ' + Math.floor(tokenExpirationEpoch - new Date().getTime() / 1000) + ' seconds!');
      }, function(err) {
        console.log('Could not refresh the token!', err.message);
      });
  }
}, 1000);


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});