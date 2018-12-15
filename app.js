/*
SPOTIFY API:
    ClientID:
        "c63e4162dc594b228c8ba937eadbe070",
    ClientSecret:
        "219afaa47233450292a43b95b8764fb6"

OMDB API:
    apikey:
        "cbc70cab"
    getlink:
        "http://www.omdbapi.com/?apikey=<apikey>&t=<search_term>"

BANDINTOWN API:
    apikey:
        "052e00f5-499b-4ceb-b64a-5162bf67613a"
    artist_getlink:
        "https://rest.bandsintown.com/artists/<artist_name>/?app_id=<apikey>"
    artistEvents_getlink:
        "https://rest.bandsintown.com/artists/<artist_name>/events/?app_id=<apikey>"

*/
var inquirer = require("inquirer");
var axios = require("axios");
var moment = require("moment");
function findResults(){
    console.log( "Searching for a " + search_type + " (" + search_term + ")..." );
    switch(search_type){
        case "song":
            var Spotify = require('node-spotify-api');
            var spotify = new Spotify({
                id: "c63e4162dc594b228c8ba937eadbe070",
                secret: "219afaa47233450292a43b95b8764fb6"
            });

            spotify.search({ type: 'track', query: search_term, limit: 2 }, function(err, data){
                if (err) {
                    console.log('Error occurred: ' + err);
                    askReplay();
                    return 0;
                }
                data.tracks.items.forEach(function(item, index){
                    var output = 
                        "  Song[" + (index+1) + "]:\n" +
                        "    Name: " + item.name + "\n" +
                        "    Track-ID: " + item.track_number + "\n" +
                        "    Preview: " + item.preview_url + "\n" +
                        "    Album:\n" +
                        "      Name: " + item.album.name + "\n" +
                        "      Image: " + item.album.images[0].url + "\n" +
                        "      Released: " + item.album.release_date + "\n" +
                        "      Tracks: " + item.album.total_tracks + "\n" +
                        "      Artists:\n";
                        item.artists.forEach(function(artist, id){
                            output +=
                            "        [" + id + "]" + "\n" +
                            "          Name:" + artist.name + "\n" +
                            "          Spotify-Link: " + artist.external_urls.spotify + "\n";
                        });

                    console.log( output );
                });
                
                askReplay();
            });
            break;

        case "movie":
            axios.get( "http://www.omdbapi.com/?apikey=cbc70cab&t=" + search_term ).then(function (movie_response) {
            var data = movie_response.data;
            var output = 
                "  Title: " + data.Title + "\n" +
                "  Released: " + data.Released + "\n" + 
                "  Rating: " + data.imdbRating + "\n" + 
                "  Language: " + data.Language + "\n" + 
                "  Actors: " + data.Actors + "\n" + 
                "  Plot: " + data.Plot + "\n" + 
                "  Poster: " + data.Poster + "\n"

            console.log( output );
                askReplay();
            })
            .catch(function (error) {
                console.log('Error occurred: ' + error);
                askReplay();
            });
            break;

        case "band":
            axios.get( "https://rest.bandsintown.com/artists/" + search_term + "/?app_id=052e00f5-499b-4ceb-b64a-5162bf67613a" ).then(function (artist_response) {
                var data = artist_response.data;
                var output = "  Band-Name: " + data.name + "\n" +
                             "  Band-Image-Link: " + data.image_url + "\n" +
                             "  Band-Upcoming-Events: " + data.upcoming_event_count + "\n";

                console.log( output );
                if(true){
                    axios.get( "https://rest.bandsintown.com/artists/" + search_term + "/events/?app_id=052e00f5-499b-4ceb-b64a-5162bf67613a" ).then(function (event_response) {
                        output = "";
                        event_response.data.forEach(function(item, index){
                            output += "Event["+ (index+1) +"]:" + "\n" +
                                      "  Place: " + item.venue.name + ", " + item.venue.city + ", " + item.venue.country + "\n" +
                                      "  Date: " + moment(item.datetime, "YYYY-MM-DDTHH:mm:ss").format("MMMM Do, YYYY") + "\n" +
                                      "  URL: " + item.url + "\n"
                        });
                        if(output !== ""){
                            console.log( output );
                        }
                        askReplay();
                    })
                    .catch(function (error) {
                        console.log('Error occurred: ' + error);
                        askReplay();
                    });
                }
            })
            .catch(function (error) {
                console.log('Error occurred: ' + error);
                askReplay();
            });
            break;
        default:
            console.log("Please type proper do either 'song' or 'movie' or 'band'!");
            break;
    }
}
function askReplay(){
    inquirer.prompt([
        {
            type: "list",
            name: "confirm",
            message: "Do you want to ask about anything",
            choices: ["Yes", "No"]
        }
    ]).then(
        function(answers){
            if(answers.confirm === "Yes"){
                askUser();
            }else{
                console.log("GoodBye!");
            }
        }
    );
}
function askUser(){
    inquirer.prompt([
        {
          type: "list",
          name: "type",
          message: "Which of the following is your search about?",
          choices: ['Song', "Movie", "Band"]
        },{
            type: "input",
            name: "term",
            message: "What are you searching for?",
        }
    ]).then(function(answers) {
        search_type = answers.type.toLowerCase();
        search_term = answers.term;
        //find the results for the search
        findResults();
        //ask if user wants another run 
    });
}

askUser();
