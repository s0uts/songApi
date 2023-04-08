/*
(c) 2022 Louis. D. Nel

WARNING:
NOTE: THIS CODE WILL NOT RUN UNTIL YOU
ENTER YOUR OWN openweathermap.org APP_ID KEY

NOTE: You need to install the npm modules by executing >npm install
before running this server

Simple express server re-serving data from openweathermap.org
To test:
http://localhost:3000
or
http://localhost:3000/weather?city=Ottawa
to just set JSON response. (Note it is helpful to add a JSON formatter extension, like JSON Formatter, to your Chrome browser for viewing just JSON data.)
*/
const express = require('express') //express framework
const http = require('http')
const path = require('path')
const hbs = require('hbs')
const logger = require('morgan');
const PORT = process.env.PORT || 3000 //allow environment variable to possible set PORT

const API_KEY = 'a8a77f20054dd628f9bcc382200e89b8'

const app = express()
app.use(logger('dev'))

const sqlite3 = require('sqlite3').verbose(); //verbose provides more detailed stack trace
const db = new sqlite3.Database('data/db_userInfo');

//setting up admin account
db.serialize(function(){
    //user: souts pass: secret
      var sqlString = "CREATE TABLE IF NOT EXISTS users (userid TEXT PRIMARY KEY, password TEXT)"
      db.run(sqlString)
      sqlString = "INSERT OR REPLACE INTO users VALUES ('souts', 'secret')"
      db.run(sqlString)
})

//Middleware
// view engine setup/setting hbs midleware
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs'); 

app.use(express.static(__dirname + '/public')) //static server - sets up script.js functionality

//Routes
app.get('/', (request, response) => {
  response.render('authCheck.hbs', {title: 'songAPI'})
})

app.post('/auth', (request, response) => {
  let username=request.query.user
  let password=request.query.pass
  console.log(`Received user ${username} and password ${password}`)
  db.all("SELECT userid, password FROM users", function(err, rows){
    let authorized=false
    for(let i=0; i<rows.length; i++){
      if(rows[i].userid == username & rows[i].password == password) authorized = true; break;
    }
    if (authorized==false){
      response.status(401).send('Not Authorized')
    } else{
      response.status(200).send('Authorized')
    }
  })
})

app.get('/authenticated', (request, response) => {
  response.render('index.hbs', {title: 'songAPI'})
})


let titleWithPlusSigns=''

app.get('/songs', (request, response) => {
  let song = request.query.title
  titleWithPlusSigns=song.split(' ').join('+')
  if(!song) {
    //send json response to client using response.json() feature
    //of express
    response.json({message: 'Please enter a song name'})
    return
  }

  const options={
    "method":"GET",
    "hostname":"itunes.apple.com",
    "port":null,
    "path":`/search?term=${titleWithPlusSigns}&entity=musicTrack&limit=3`,
    "headers":{
        "useQueryString":true
    }
  }

  //create the actual http request and set up
  //its handlers
  http.request(options, function(apiResponse) {
    let songData = ''
    apiResponse.on('data', function(chunk) {
      songData += chunk
    })
    apiResponse.on('end', function() {
      //response.contentType('application/json').json(JSON.parse(songData))
      songData = JSON.parse(songData)
      response.render('songDetails.hbs', { title: `Results for Song Name '${song}'`, song: songData.results});
    })
  }).end() //important to end the request
           //to actually send the message
})

//start server
app.listen(PORT, err => {
  if(err) console.log(err)
  else {
    console.log(`Server listening on port: ${PORT}`)
    console.log(`To Test:`)
    console.log(`http://localhost:3000/songs?title=Body+And+Soul`)
    console.log(`http://localhost:3000`)
  }
})
