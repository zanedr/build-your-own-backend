const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.set('port', process.env.PORT || 3000);
app.locals.title = 'byob';

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static(`${__dirname}/public`))

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/public/index.html')
})

app.get('/api/v1/artists/all', (req, res) => {
  database('artists').select()
  .then((artists) => {
    if(!artists) {
      res.status(404).send({
        error: 'No artists were found'
      })
    } else {
      res.status(200).json(artists)
    }
  }).catch((error) => {
    res.status(500)
  })
})

app.get('/api/v1/songs/all', (req, res) => {
  database('songs').select()
  .then((songs) => {
    if(!songs) {
      res.status(404).send({
        error: 'No songs were found'
      })
    } else {
      res.status(200).json(songs)
    }
  }).catch((error) => {
    res.status(500)
  })
})

app.get('/api/v1/artists/id/:id', (req, res) => {
  const id = req.params.id
  database('artists').where('id', id)
  .then((singleArtist) => {
    if(!singleArtist) {
      res.status(404).send({
        error: 'That artist doesn\'t seem to be here'
      })
    } else {
      res.status(200).json(singleArtist)
    }
  })
  .catch(() => {
    res.status(500)
  })
})

app.get('/api/v1/artists', (req, res) => {
  const artistName = req.query.name
  console.log(req.query);
  database('artists')
    .where(database.raw('lower("name")'), artistName.toLowerCase())
  .then((singleArtist) => {
    if(!singleArtist) {
      res.status(404).send({
        error: 'That artist doesn\'t seem to be here'
      })
    } else {
      res.status(201).json(singleArtist)
    }
  })
  .catch(() => {
    res.status(500)
  })
})

app.get('/api/v1/songs/id/:id', (req, res) => {
  const id = req.params.id
  database('songs').where('id', id)
  .then((singleSong) => {
    if(!singleSong) {
      res.status(404).send({
        error: 'That song doesn\'t seem to be here'
      })
    } else {
      res.status(200).json(singleSong)
    }
  })
  .catch(() => {
    res.status(500)
  })
})

app.get('/api/v1/songs', (req, res) => {
  const songTitle = req.query.title
  database('songs')
    .where(database.raw('lower("title")'), songTitle.toLowerCase())
  .then((singleSong) => {
    if(!singleSong) {
      res.status(404).send({
        error: 'That song doesn\'t seem to be here'
      })
    } else {
      res.status(201).json(singleSong)
    }
  })
  .catch(() => {
    res.status(500)
  })
})

app.post('/api/v1/artists', (req, res) => {
  const {artistName} = req.body
  database('artists')
    .where(database.raw('lower("name")'), artistName.toLowerCase())
  .then((singleArtist) => {
    if(!singleArtist) {
      res.status(404).send({
        error: 'That artist doesn\'t seem to be here'
      })
    } else {
      res.status(201).json(singleArtist)
    }
  })
  .catch(() => {
    res.status(500)
  })
})

app.post('/api/v1/songs', (req, res) => {
  const {songTitle} = req.body
  console.log('songTitle', songTitle);
  database('songs')
    .where(database.raw('lower("title")'), songTitle.toLowerCase())
  .then((singleSong) => {
    if(!singleSong) {
      res.status(404).send({
        error: 'That song doesn\'t seem to be here'
      })
    } else {
      res.status(201).json(singleSong)
    }
  })
  .catch(() => {
    res.status(500)
  })
})

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`)
})
