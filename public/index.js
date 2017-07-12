
const scrubArtists = () => {
  const scrubbedArtists = []
  artistArray.forEach((artist, index) => {
    if(scrubbedArtists.indexOf(artist.name) === -1) {
      scrubbedArtists[scrubbedArtists.length] = artist.name
    }
  })
  return scrubbedArtists
}

console.log(scrubArtists())
