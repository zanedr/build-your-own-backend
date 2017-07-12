###API use for build-your-own-backend

####GET methods

* **/api/v1/songs/all** - returns all songs in library
* **/api/v1/artists/all** - returns all artists in library
* **/api/v1/songs/id/:id** - will return song with that specific ID
* **/api/v1/artist/id/:id** - will return artist with that specific ID
* **/api/v1/artist/?search=***band name* - will return all songs attributed to that artist. Capitalization doesn't matter
* **/api/v1/song/?search=***song title* - will return song with that name. Capitalization doesn't matter

####POST methods
* **/api/v1/songs/add** - body requires *title* and *artist_name* properties. Adds new song to the library. *Will not work if artist is not already in library.* This will be rectified later if time allows.
* **/api/v1/artists/add** - body requires *name* property. Adds new artist to library.

-not built-

####PUT methods
* **/api/v1/songs/edit** - body requires *title* property to reference original song name, and allows the editing of information through *newArtist_name* or *newTitle* properties
* **/api/v1/artists/edit** - body requires *name* property to reference original artist name, and will change current name to information included with the *newName* property

####DELETE methods
* **/api/v1/artists/delete/?name=***band name* - deletes artist and all songs by that artist from the database
* **/api/v1/songs/delete/?title=***song title* - deletes individual song from database