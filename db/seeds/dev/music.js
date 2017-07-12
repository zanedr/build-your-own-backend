const artistData = require('../../../data/artistData');
const songData = require('../../../data/songData');


exports.seed = function(knex, Promise) {
  return knex('songs').del()
  .then(() => {
    return knex('artists').del();
  })
  .then(() => {
    return knex('artists').insert(artistData);
  })
  .then(() => {
    let songPromises = [];
    songData.forEach((song) => {
      let artistName = song.artist_name;
      songPromises.push(createSong(knex, song, artistName));
    });
    return Promise.all(songPromises);
  });
};

const createSong = (knex, song, artistName) => {
  return knex('artists').where('name', artistName).select('id')
  .then((artistConnect) => {
    console.log('ARTIST', artistConnect[0].id)
    return knex('songs').insert({
      title: song.title,
      artist_name: song.artist_name,
      artist_id: artistConnect[0].id
    });
  });
};
