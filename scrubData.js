const songList = './songsAndArtist.json'

const cleanList = (data) => {
  const artistList = []
  songList.forEach((song, index) => {
    let counter = 0
    artistList.forEach(artist => {
      if(song.artist_id == artist) {
        counter++
      }
    })
    if(counter === 0) {
      artistList[artistList.length].name = artist_id
      artistList[artistList.length].songs[0] = song
    } else {
      artistList[artistList.length].songs.push(song)
    }
  })
  return artistList
}

cleanList(songList)
