### API use for build-your-own-backend

[![CircleCI](https://circleci.com/gh/zanedr/build-your-own-backend.svg?style=svg)](https://circleci.com/gh/zanedr/build-your-own-backend)

####Data Source

[five-thirty-eight classic rock](https://github.com/fivethirtyeight/data/tree/master/classic-rock)

#### GET methods
*All queries are strings appended to the end of request URL.*

* **/api/v1/songs/all** - returns all songs in library
* **/api/v1/artists/all** - returns all artists in library
* **/api/v1/songs/id/:id** - will return song with that specific ID
* **/api/v1/artist/id/:id** - will return artist with that specific ID
* **/api/v1/artist/?search=** *band name* - will return all songs attributed to that artist. Capitalization doesn't matter
* **/api/v1/song/?search=** *song title* - will return song with that name. Capitalization doesn't matter

#### POST methods
*All POST endpoints are protected with JWT's*

* **/api/v1/songs/add** - body requires *title* and *artist_name* properties. Adds new song to the library. *Will not work if artist is not already in library.* This will be rectified later if time allows.
	
	Example JSON object for adding a song:
	
	```
	{
		title: <Title of song as a string>,
		artist_name: <Name of artist as a string. Artist must currently exist in database.>
	}
	```

* **/api/v1/artists/add** - body requires *name* property. Adds new artist to library.

	Example JSON object for adding an artist:
	
	```
	{
		name: <Name of artist as a string. Will fail if artist currently exists in database>
	}
	```

#### PUT methods
*All POST endpoints are protected with JWT's*

* **/api/v1/songs/edit** - body requires *originalTitle* property to reference original song name, and allows the editing of information through *newArtist_name* or *newTitle* properties. May require *originalArtist_name* property for further reference if multiple songs have the same title.

	Example JSON object for editing a song. JSON object must include *originalTitle* and *newTitle* properties to work.  *originalArtist_name* and *newArtist_name* are optional.
	
	```
	{
		originalTitle: <Title of song currently in database as a string>,
		newTitle: <New title of song as a string>,
		originalArtist_name: <Original artist name as a string>,
		newArtist_name: <New artist of song as a string>
	}
	```

* **/api/v1/artists/edit** - body requires *originalName* property to reference original artist name, and will change current name to information included with the *newName* property.

	Example JSON object for adding an artist. Both *originalName* and *newName* properties are required.
	
	```
	{
		originalName: <Original name of artist as currently exists in database, as a string>,
		newName: <Desired change for artist name, as a string>
	}
	```

#### DELETE methods

*All queries are strings appended to the end of request URL.*

* **/api/v1/artists/delete/?name=** *band name* - deletes artist and all songs by that artist from the database. Capitalization doesn't matter.
* **/api/v1/songs/delete/?title=** *song title* - deletes individual song from database. Capitalization doesn't matter.
