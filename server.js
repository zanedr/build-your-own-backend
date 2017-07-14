
const environment = process.env.NODE_ENV || 'testing';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

const express = require('express');

const app = express();
const jwt = require('jsonwebtoken');
const config = require('dotenv').config().parsed;
const bodyParser = require('body-parser');

app.set('port', process.env.PORT || 3000);
app.locals.title = 'byob';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(`${__dirname}/public`));

app.get('/', (request, response) => {
  response.sendFile(`${__dirname}/public/index.html`);
});

if (process.env.NODE_ENV === 'production' && (!config.CLIENT_SECRET || !config.USERNAME || !config.PASSWORD)) {
  throw new Error('Either CLIENT_SECRET, USERNAME, or PASSWORD is missing from .env file');
}

app.set('secretKey', process.env.CLIENT_SECRET || config.CLIENT_SECRET);
const token = jwt.sign('token', app.get('secretKey'));

const checkAuth = (request, response, next) => {
  const authToken = request.body.token ||
                request.param.token ||
                request.headers.authorization;

  if (authToken) {
    jwt.verify(authToken, app.get('secretKey'), (error, decoded) => {
      if (error) {
        return response.status(403).send({
          success: false,
          message: 'Invalid authorization token.'
        });
      } else {
        request.decoded = decoded;
        next();
      }
    });
  } else {
    return response.status(403).send({
      success: false,
      message: 'You must be authorized to hit this endpoint',
    });
  }
};

app.post('/authenticate', (request, response) => {
  const user = request.body;

  if (user.username !== config.USERNAME || user.password !== config.PASSWORD) {
    response.status(403).send({
      success: false,
      message: 'Invalid Credentials'
    });
  } else {
    const token = jwt.sign(user, app.get('secretKey'), {
      expiresIn: 1728000,
    });

    response.json({
      success: true,
      username: user.username,
      token: token
    });
  }
});

// return all artists
app.get('/api/v1/artists/all', (req, res) => {
  database('artists').select()
  .then((artists) => {
    if (!artists) {
      return res.status(404).send({
        error: 'No artists were found'
      });
    } else {
      return res.status(200).json(artists);
    }
  }).catch((error) => {
    return res.status(500);
  });
});

// return all songs
app.get('/api/v1/songs/all', (req, res) => {
  database('songs').select()
  .then((songs) => {
    if (!songs) {
      return res.status(404).send({
        error: 'No songs were found'
      });
    } else {
      return res.status(200).json(songs);
    }
  }).catch((error) => {
    return res.status(500);
  });
});

// return artist by id
app.get('/api/v1/artists/id/:id', (req, res) => {
  const id = req.params.id;

  database('artists').where('id', id)
  .then((singleArtist) => {
    if (!singleArtist) {
      return res.status(404).send({
        error: 'That artist doesn\'t seem to be here'
      });
    } else {
      return res.status(200).json(singleArtist);
    }
  })
  .catch(() => {
    return res.status(500);
  });
});

// return artist by name
app.get('/api/v1/artists', (req, res) => {
  const artistName = req.query.search;
  database('songs')
    .where(database.raw('lower("artist_name")'), artistName.toLowerCase())
  .then((artistSongs) => {
    if (!artistSongs.length) {
      return res.status(404).send({
        error: 'That artist doesn\'t seem to be here'
      });
    } else {
      return res.status(201).json(artistSongs);
    }
  })
  .catch(() => {
    return res.status(500);
  });
});

// return song by id
app.get('/api/v1/songs/id/:id', (req, res) => {
  const id = req.params.id;
  database('songs').where('id', id)
  .then((singleSong) => {
    if (!singleSong) {
      return res.status(404).send({
        error: 'That song doesn\'t seem to be here'
      });
    } else {
      return res.status(201).json(singleSong);
    }
  })
  .catch(() => {
    return res.status(500);
  });
});

// return song by title
app.get('/api/v1/songs', (req, res) => {
  const songTitle = req.query.search;
  database('songs')
    .where(database.raw('lower("title")'), songTitle.toLowerCase())
  .then((singleSong) => {
    if (!singleSong.length) {
      return res.status(404).send({
        error: 'That song doesn\'t seem to be here'
      });
    } else {
      return res.status(201).json(singleSong);
    }
  })
  .catch(() => {
    return res.status(500);
  });
});

// add artist
app.post('/api/v1/artists/add', checkAuth, (req, res) => {
  if (!req.body.name) {
    return res.status(422).send({
      error: 'Something was wrong with the data sent.'
    });
  }
  const name = req.body.name;
  database('artists')
    .where(database.raw('lower("name")'), name.toLowerCase())
  .then((singleArtist) => {
    if (singleArtist[0]) {
      return res.status(422).send({
        error: 'Artist is already in database'
      });
    } else {
      database('artists').insert({ name: name }, 'id')
      .then(() => {
        return res.status(201).send({
          success: `Artist ${name} added to database`
        });
      });
    }
  })
  .catch(() => {
    return res.status(500);
  });
});

// add song
app.post('/api/v1/songs/add', checkAuth, (req, res) => {
  const { title, artist_name } = req.body;

  for (let requiredParameter of ['title', 'artist_name']) {
    if (!req.body[requiredParameter]) {
      return res.status(422).send({
        error: 'Something was wrong with the data sent.'
      });
    }
  }
  database('artists')
    .where(database.raw('lower("name")'), artist_name.toLowerCase())
    .then((artistFound) => {
      if (!artistFound[0]) {
        return res.status(422).send({
          error: 'Artist not found, please create artist before attributing songs.'
        });
      } else {
        database('songs')
          .where(database.raw('lower("title")'), title.toLowerCase())
        .then((singleSong) => {
          if (artistFound[0] && singleSong[0]) {
            return res.status(422).send({
              error: 'Song is already in the database under that artist'
            });
          } else {
            database('songs').insert({ title: title,
              artist_name: artist_name,
              artist_id: artistFound[0].id },
              'id')
            .then((newArtist) => {
              return res.status(201).send({
                success: `Song ${title} added to database under ${artistFound[0].name}`
              });
            });
          }
        });
      }
    })

  .catch(() => {
    return res.status(500);
  });
});

// edit artist info
app.patch('/api/v1/artists/edit/', checkAuth, (req, res) => {
  const { newName, originalName } = req.body;
  if (!originalName || !newName) {
    return res.status(400).send({
      error: 'One of the necessary input fields in missing. Make sure both "originalName" and "newName" are present and defined.'
    });
  }
  database('artists').where('name', originalName)
  .then((singleArtist) => {
    if (!singleArtist.length) {
      return res.status(404).send({
        error: 'Can\'t find that band in the database'
      });
    } else {
      database('artists').where('id', singleArtist[0].id)
      .update('name', newName)
      .then(() => {
        return res.status(201).send({
          success: `Artist ${originalName} has been renamed to ${newName}`
        });
      });
    }
  })
  .catch(() => {
    return res.status(500);
  });
});

// edit song info
app.patch('/api/v1/songs/edit/', checkAuth, (req, res) => {
  const { newTitle, originalTitle, originalArtist_name, newArtist_name } = req.body;
  if (!originalTitle) {
    return res.status(400).send({
      error: 'Please include "originalTitle" property for reference.'
    });
  } else if (!newTitle && !newArtist_name) {
    return res.status(400).send({
      error: 'No updated information provided. Please include either "newTitle" or "newArtist_name".'
    });
  } else if (originalArtist_name && originalTitle && !newArtist_name) {
    database('songs')
    .where('title', originalTitle)
    .where('artist_name', originalArtist_name)
    .update('title', newTitle)
    .then((singleSong) => {
      return res.status(201).send({
        success: `Song ${originalTitle} has been renamed to ${newTitle}`
      });
    });
  } else if (!originalArtist_name && originalTitle) {
    database('songs').where('title', originalTitle)
    .then((singleArtist) => {
      if (!singleArtist.length) {
        return res.status(404).send({
          error: 'Can\'t find that song in the database'
        });
      } else if (singleArtist.length > 1) {
        return res.status(400).send({
          error: 'Multiple songs found with that title. Please include "originalArtist_name" with the request.'
        });
      } else {
        database('songs').where('id', singleArtist[0].title)
        .update('title', newTitle)
        .then(() => {
          return res.status(201).send({
            success: `Song ${originalTitle} has been renamed to ${newTitle}`
          });
        })
        .catch(() => {
          return res.status(500);
        });
      }
    });
  } else {
    database('artists').where('name', originalArtist_name)
    .then((originalArtist) => {
      if (!originalArtist.length) {
        return res.status(422).send({
          error: 'Artist not found, please create artist before attributing songs.'
        });
      } else {
        database('songs')
        .where('title', originalTitle)
        .where('artist_name', originalArtist_name)
        .update('title', newTitle)
        .update('artist_name', newArtist_name)
        .then(() => {
          return res.status(201).send({
            success: `Song ${originalTitle} by ${originalArtist_name} has been changed to ${newTitle} by ${newArtist_name}`
          });
        })
        .catch(() => {
          return res.status(500);
        });
      }
    });
  }
});

// delete artist
app.delete('/api/v1/artists/delete/', (req, res) => {
  const name = req.query.name;

  database('artists').where('name', name)
  .then((singleArtist) => {
    if (!singleArtist.length) {
      return res.status(404).send({
        error: `${name} not found in artist database`
      });
    }
    database('artists').where('id', singleArtist[0].id).del();
  });
  database('songs').where('artist_name', name)
  .then((artistSongs) => {
    artistSongs.forEach((song) => {
      database('songs').where('id', song.id).del();
    });
  })
  .then(() => {
    return res.status(204).send({
      success: `Artist entitled ${name} and all songs associated have been deleted from database`
    });
  })
  .catch(() => {
    return res.status(500);
  });
});

// delete song
app.delete('/api/v1/songs/delete/', (req, res) => {
  const title = req.query.title;

  database('songs').where('title', title).del()
  .then(() => {
    return res.status(204).send({
      success: `Song entitled ${title} has been deleted from database`
    });
  })
    .catch(() => {
      return res.status(500);
    });
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`)
});

module.exports = app;
