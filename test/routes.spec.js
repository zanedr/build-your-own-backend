const chai = require('chai');

const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server.js');

const environment = process.env.NODE_ENV || 'production';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InBhc3N3b3JkIiwicGFzc3dvcmQiOiJwYXNzd29yZCIsImlhdCI6MTQ5OTk4NjA5OSwiZXhwIjoxNTAxNzE0MDk5fQ.qEAKVrXfIdeEg6Zh5lIkBORfIHmaGRImxccGF1HHDP4';

chai.use(chaiHttp);

describe('API Routes', () => {
  before((done) => {
    database.migrate.latest();
    done();
  });

  beforeEach((done) => {
    database.seed.run()
    .then(() => {
      done();
    });
  });

  it('GET: should return all artists in db', (done) => {
    chai.request(server)
    .get('/api/v1/artists/all')
    .end((err, response) => {
      response.should.have.status(200);
      response.should.be.json;
      response.body.should.be.a('array');
      response.body.length.should.equal(2);
      response.body[0].should.have.property('name');
      done();
    });
  });

  it('GET: should return all songs in db', (done) => {
    chai.request(server)
    .get('/api/v1/songs/all')
    .end((err, response) => {
      response.should.have.status(200);
      response.should.be.json;
      response.body.should.be.a('array');
      response.body.length.should.equal(107);
      response.body[0].should.have.property('title');
      response.body[0].should.have.property('artist_name');
      done();
    });
  });

  it('GET: should return a single artist by id', (done) => {
    chai.request(server)
    .get('/api/v1/artists/id/1')
    .end((err, response) => {
      response.should.have.status(200);
      response.should.be.json;
      done();
    });
  });

  it('GET: should return a single song by id', (done) => {
    chai.request(server)
    .get('/api/v1/songs/id/2')
    .end((err, response) => {
      response.should.have.status(201);
      response.should.be.json;
      done();
    });
  });

  it('GET: should return a single artist by name', (done) => {
    chai.request(server)
    .get('/api/v1/artists/?search=Led+Zeppelin')
    .end((err, response) => {
      response.should.have.status(201);
      response.should.be.json;
      response.body.should.have.length(68);
      response.body[0].should.have.property('artist_name');
      response.body[0].should.have.property('title');
      done();
    });
  });

  it('GET: if artist is not in database, should return 404', (done) => {
    chai.request(server)
    .get('/api/v1/artists/?search=Vulfpeck')
    .end((err, response) => {
      response.should.have.status(404);
      done();
    });
  });

  it('GET: should return a single song by name', (done) => {
    chai.request(server)
    .get('/api/v1/songs/?search=Going+to+California')
    .end((err, response) => {
      response.should.have.status(201);
      response.should.be.json;
      response.body[0].should.have.property('title');
      response.body[0].title.should.equal('Going to California');
      response.body[0].artist_name.should.equal('Led Zeppelin');
      done();
    });
  });

  it('GET: if song is not in database, should return 404', (done) => {
    chai.request(server)
    .get('/api/v1/songs/search/?search=Bohemian+Rhapsody')
    .end((err, response) => {
      response.should.have.status(404);
      done();
    });
  });

  it('POST: should allow an artist to be inserted into the database', (done) => {
    chai.request(server)
    .post('/api/v1/artists/add')
    .set('Authorization', authToken)
    .send({
      name: 'Bill Evans',
    })
    .end((err, response) => {
      response.should.have.status(201);
      response.should.be.json;
      response.body.should.have.property('success');
      response.body.success.should.equal('Artist Bill Evans added to database');
      done();
    });
  });

  it('POST: should not allow an artist to be inserted into the database if it already exists', (done) => {
    chai.request(server)
    .post('/api/v1/artists/add')
    .set('Authorization', authToken)
    .send({
      name: 'Led Zeppelin',
    })
    .end((err, response) => {
      response.should.have.status(422);
      response.should.be.json;
      response.body.should.have.property('error');
      response.body.error.should.equal('Artist is already in database');
      done();
    });
  });

  it('POST: should not allow an artist to be inserted into the database correct data is not provided', (done) => {
    chai.request(server)
    .post('/api/v1/artists/add')
    .set('Authorization', authToken)
    .send({
      name: '',
    })
    .end((err, response) => {
      response.should.have.status(422);
      response.should.be.json;
      response.body.should.have.property('error');
      response.body.error.should.equal('Something was wrong with the data sent.');
      done();
    });
  });

  it('POST: should allow a song to be inserted into the database', (done) => {
    chai.request(server)
    .post('/api/v1/songs/add')
    .set('Authorization', authToken)
    .send({
      title: 'Frankenstein',
      artist_name: 'Led Zeppelin',
    })
    .end((err, response) => {
      response.should.have.status(201);
      response.should.be.json;
      response.body.should.have.property('success');
      response.body.success.should.equal('Song Frankenstein added to database under Led Zeppelin');
      done();
    });
  });

  it('POST: should not allow a song to be inserted into the database if it already exists', (done) => {
    chai.request(server)
    .post('/api/v1/songs/add')
    .set('Authorization', authToken)
    .send({
      title: 'Down By The Seaside',
      artist_name: 'Led Zeppelin',
    })
    .end((err, response) => {
      response.should.have.status(422);
      response.should.be.json;
      response.body.should.have.property('error');
      response.body.error.should.equal('Song is already in the database under that artist');
      done();
    });
  });

  it('POST: should not allow a song to be inserted into the database if correct data is not provided', (done) => {
    chai.request(server)
    .post('/api/v1/songs/add')
    .set('Authorization', authToken)
    .send({
      title: '',
    })
    .end((err, response) => {
      response.should.have.status(422);
      response.should.be.json;
      response.body.should.have.property('error');
      response.body.error.should.equal('Something was wrong with the data sent.');
      done();
    });
  });

  it('PATCH: should allow an artist to be edited into the database', (done) => {
    chai.request(server)
    .patch('/api/v1/artists/edit')
    .set('Authorization', authToken)
    .send({
      originalName: 'Led Zeppelin',
      newName: 'Iron Blimp',
    })
    .end((err, response) => {
      response.should.have.status(201);
      response.should.be.json;
      response.body.should.have.property('success');
      response.body.success.should.equal('Artist Led Zeppelin has been renamed to Iron Blimp');
      done();
    });
  });

  it('PATCH: should not allow an artist to be edited into the database if band doesn\'t exist', (done) => {
    chai.request(server)
    .patch('/api/v1/artists/edit')
    .set('Authorization', authToken)
    .send({
      originalName: 'The Beatles',
      newName: 'The Beetles',
    })
    .end((err, response) => {
      response.should.have.status(404);
      response.should.be.json;
      response.body.should.have.property('error');
      response.body.error.should.equal('Can\'t find that band in the database');
      done();
    });
  });

  it('PATCH: should not allow an artist to be edited if correct data is not provided', (done) => {
    chai.request(server)
    .patch('/api/v1/artists/edit')
    .set('Authorization', authToken)
    .send({
      title: '',
    })
    .end((err, response) => {
      response.should.have.status(400);
      response.should.be.json;
      response.body.should.have.property('error');
      response.body.error.should.equal('One of the necessary input fields in missing. Make sure both "originalName" and "newName" are present and defined.');
      done();
    });
  });

  it('PATCH: should allow a song to be edited into the database', (done) => {
    chai.request(server)
    .patch('/api/v1/songs/edit')
    .set('Authorization', authToken)
    .send({
      originalArtist_name: 'Led Zeppelin',
      originalTitle: 'Going to California',
      newTitle: 'Mandolin City',
    })
    .end((err, response) => {
      response.should.have.status(201);
      response.should.be.json;
      response.body.should.have.property('success');
      response.body.success.should.equal('Song Going to California has been renamed to Mandolin City');
      done();
    });
  });

  it('PATCH: should not allow a song to be edited into the database if song doesn\'t exist', (done) => {
    chai.request(server)
    .patch('/api/v1/songs/edit')
    .set('Authorization', authToken)
    .send({
      originalTitle: 'Frankenstein',
      newTitle: 'Frankenstein 2: Frankensteinier',
    })
    .end((err, response) => {
      response.should.have.status(404);
      response.should.be.json;
      response.body.should.have.property('error');
      response.body.error.should.equal('Can\'t find that song in the database');
      done();
    });
  });

  it('PATCH: should not allow a song to be edited if correct data is not provided', (done) => {
    chai.request(server)
    .patch('/api/v1/artists/edit')
    .set('Authorization', authToken)
    .send({
      title: '',
    })
    .end((err, response) => {
      response.should.have.status(400);
      response.should.be.json;
      response.body.should.have.property('error');
      response.body.error.should.equal('One of the necessary input fields in missing. Make sure both "originalName" and "newName" are present and defined.');
      done();
    });
  });

  it('DELETE: should allow a song to be deleted', (done) => {
    chai.request(server)
    .delete('/api/v1/songs/delete/?title=Going+To+California')
    .end((err, response) => {
      response.should.have.status(204);
      done();
    });
  });

  it('DELETE: should allow artist to be deleted', (done) => {
    chai.request(server)
    .delete('/api/v1/artists/delete/?name=Pink+Floyd')
    .end((err, response) => {
      response.should.have.status(204);
      done();
    });
  });
});
