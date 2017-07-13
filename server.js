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
  database('songs')
    .where(database.raw('lower("artist_name")'), artistName.toLowerCase())
  .then((artistSongs) => {
    if(!artistSongs.length) {
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
    if(!singleSong.length) {
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

app.patch('/api/v1/artists/edit/', (req, res) => {
  const { newName, originalName } = req.body
  if(!originalName || !newName) {
    res.status(400).send({
      error: 'One of the necessary input fields in missing. Make sure both "originalName" and "newName" are present and defined.'
    })
  }
  database('artists').where('name', originalName)
  .then((singleArtist) => {
    if(!singleArtist.length) {
      res.status(404).send({
        error: 'Can\'t find that band in the database'
      })
    } else {
      database('artists').where('id', singleArtist[0].id)
      .update('name', newName)
      .then(() => {
        res.status(201).send({
          success: `Artist ${originalName} has been renamed to ${newName}`
        })
      })
    }
  })
  .catch(() => {
    res.status(500)
  })
})

app.patch('/api/v1/songs/edit/', (req, res) => {
  const { newTitle, originalTitle, originalArtist_name, newArtist_name } = req.body
  if(!originalTitle) {
    res.status(400).send({
      error: 'Please include "originalTitle" property for reference.'
    })
  } else if(!newTitle && !newArtist_name) {
    res.status(400).send({
      error: 'No updated information provided. Please include either "newTitle" or "newArtist_name".'
    })
  } else if(originalArtist_name && originalTitle && !newArtist_name) {
    database('songs').where('title', originalTitle).where('artist_name', originalArtist_name)
    .update('title', newTitle)
    .then((singleSong) => {
      res.status(201).send({
        success: `Song ${originalTitle} has been renamed to ${newTitle}`
      })
      .catch(() => {
        res.status(500)
      })
    })
  } else if(!originalArtist_name && originalTitle) {
    database('songs').where('title', originalTitle)
    .then((singleArtist) => {
      if(!singleArtist.length) {
        res.status(404).send({
          error: 'Can\'t find that song in the database'
        })
      } else if(singleArtist.length > 1) {
        res.status(400).send({
          error: 'Multiple songs found with that title. Please include "originalArtist_name" with the request.'
        })
      } else {
        database('songs').where('id', singleArtist[0].title)
        .update('title', newTitle)
        .then(() => {
          res.status(201).send({
            success: `Song ${originalTitle} has been renamed to ${newTitle}`
          })
        })
        .catch(() => {
          res.status(500)
        })
      }
    })
  } else {
    database('songs').where('title', originalTitle).where('artist_name', originalArtist_name)
    .update('title', newTitle).update('artist_name', newArtist_name)
    .then(() => {
      res.status(201).send({
        success: `Song ${originalTitle} by ${originalArtist_name} has been changed to ${newTitle} by ${newArtist_name}`
      })
    })
    .catch(() => {
      res.status(500)
    })
  }
})

app.delete('/api/v1/artists/delete/', (req, res) => {
  const name = req.query.name

  database('artists').where('name', name)
  .then((singleArtist) => {
  if(!singleArtist.length) {
    res.status(404).send({
      error: `${name} not found in artist database`
    })
  }
    database('artists').where('id', singleArtist[0].id).del()
  })
  database('songs').where('artist_name', name)
  .then((artistSongs) => {
    artistSongs.forEach(song => {
      database('songs').where('id', song.id).del()
    })
  })
  .then(() => {
    res.status(200).send({
      result: `Artist entitled ${name} and all songs associated have been deleted from database`
    })
  })
  .catch(() => {
    res.status(500)
  })
})

app.delete('/api/v1/songs/delete/', (req, res) => {
  const title = req.query.title

  database('songs').where('title', title).del()
  .then(() => {
      res.status(200).send({
        result: `Song entitled ${title} has been deleted from database`
      })
    })
    .catch(() => {
      res.status(500)
    })
})

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`)
})
