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
  const artistName = req.query.search
  console.log(req.query);
  database('songs')
    .where(database.raw('lower("artist_name")'), artistName.toLowerCase())
  .then((artistSongs) => {
    if(!artistSongs) {
      res.status(404).send({
        error: 'That artist doesn\'t seem to be here'
      })
    } else {
      res.status(201).json(artistSongs)
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
  const songTitle = req.query.search
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

app.post('/api/v1/artists/add', (req, res) => {
  if(!req.body.name){
    res.status(422).send({
      error: 'Something was wrong with the data sent.'
    })
  }
  const name = req.body.name
  database('artists')
    .where(database.raw('lower("name")'), name.toLowerCase())
  .then((singleArtist) => {
    if(singleArtist[0]) {
      res.status(422).send({
        error: 'Artist is already in database'
      })
    } else {
      database('artists').insert({ name: name}, 'id')
      .then((newArtist) => {
        res.status(201).send({
          status: `Artist ${name} added to database`
        })
      })
    }
  })
  .catch(() => {
    res.status(500)
  })
})

app.post('/api/v1/songs/add', (req, res) => {
  const { title, artist_name } = req.body
  let checkForArtist = ''
  for(let requiredParameter of ['title', 'artist_name']) {
    if(!req.body[requiredParameter]){
      res.status(422).send({
        error: 'Something was wrong with the data sent.'
      })
    }
  }
  database('artists')
    .where(database.raw('lower("name")'), artist_name.toLowerCase())
    .then((artistFound) => {
      if(!artistFound[0]) {
        res.status(422).send({
          error: 'Artist not found, please create artist before attributing songs.'
        })
      }
      else {
        database('songs')
          .where(database.raw('lower("title")'), title.toLowerCase())
        .then((singleSong) => {
          if(artistFound[0] && singleSong[0]) {
            res.status(422).send({
              error: 'Song is already in the database under that artist'
            })
          }
          else {
            database('songs').insert({title: title,
                                      artist_name: artist_name,
                                      artist_id: artistFound[0].id},
                                      'id')
            .then((newArtist) => {
              res.status(201).send({
                status: `Song ${title} added to database under ${artistFound[0].name}`
              })
            })
          }
        })
      }
    })

  .catch(() => {
    res.status(500)
  })
})

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`)
})
