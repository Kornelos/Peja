const Genius = require('genius-api');
const fetch = require("node-fetch");

const accessToken = process.env.GENIUS_TOKEN;

const genius = new Genius(accessToken);


const http = require('http');
const hostname = process.env.YOUR_HOST || '0.0.0.0';
const PORT = process.env.PORT || 3000;

// genius API does not have an artist entrypoint.
// Instead, search for the artist => get a song by that artist => get API info on that song => get artist id
Genius.prototype.getArtistIdByName = function getArtistIdByName(artistName) {
  const normalizeName = name => name.replace(/\./g, '').toLowerCase();   // regex removes dots
  const artistNameNormalized = normalizeName(artistName);

  return this.search(artistName)
    .then((response) => {
      for (let i = 0; i < response.hits.length; i += 1) {
        const hit = response.hits[i];
        if (hit.type === 'song' && normalizeName(hit.result.primary_artist.name) === artistNameNormalized) {
          return hit.result
        }
      }
      throw new Error(`Did not find any songs whose artist is "${artistNameNormalized}".`)
    })
    .then(songInfo => songInfo.primary_artist.id)
};




Genius.prototype.getSongLyrics = function getSongLyrics(geniusUrl) {
  return fetch(geniusUrl, {
    method: 'GET',
  })
  .then(response => {
    if (response.ok) return response.text();
    throw new Error('Could not get song url ...')
  })
  .then(parseSongHTML)
};

// parse.js
const cheerio = require('cheerio');


function parseSongHTML(htmlText) {
  const $ = cheerio.load(htmlText);
  const lyrics = $('.lyrics').text();
  const releaseDate = $('release-date .song_info-info').text();
  return {
    lyrics,
    releaseDate,
  }
}

//const genius = new Genius(accessToken)
function getPeja(completionHandler) {
    genius.getArtistIdByName('Peja')
        .then(artistId => {
            genius.songsByArtist(artistId, {
                per_page: 50,
                sort: 'popularity',
            })
                .then(songs => {
                    const urls = songs.songs.map(song => song.url);
                    // console.log(songs);
                    const randomNumber = Math.floor(Math.random() * 51);
                    genius.getSongLyrics(urls[randomNumber])
                        .then(text => {
                            console.log(text)
                            completionHandler(text.lyrics.toString());
                        })
                })
                .catch(err => console.error(err));


        })
        .catch(err => console.error(err));
}


const server = http.createServer((req, res) => {

  getPeja(function (text) {
      res.statusCode = 200;
     // res.setHeader('Content-Type', 'text/plain');
      res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
      res.end(text);
  })
});

server.listen(PORT, hostname, () => {
  console.log(`Server running at http://${hostname}:${PORT}/`);
});
