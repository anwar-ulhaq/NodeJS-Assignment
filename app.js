'use strict';
require('dotenv').config();
const express   = require('express');
const app       = express();
//const mysql     = require('mysql2');
const multer    = require('multer');
const upload    = multer({dest: 'public/uploads/'});
app.use(express.static('public'));

const fs            = require('fs');
const https         = require('https');
const http          = require('http');
const bodyParser    = require('body-parser');
const passport      = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session       = require('express-session');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//My own module for handling database
const database  = require('./modules/database');
const resize = require('./modules/resize');
const exif = require('./modules/exif');

// create the connection to database
const connection = database.connect();

/*
*     #################     Session and Cookies Starts Here      ####################
*/
passport.serializeUser((user, done) => {
  console.log('serialize: ' + user);
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

/*
Set the following cookie options to enhance security:

secure - Ensures the browser only sends the cookie over HTTPS.
httpOnly - Ensures the cookie is sent only over HTTP(S), not client JavaScript, helping to protect against cross-site scripting attacks.
domain - indicates the domain of the cookie; use it to compare against the domain of the server in which the URL is being requested. If they match, then check the path attribute next.
path - indicates the path of the cookie; use it to compare against the request path. If this and domain match, then send the cookie in the request.
expires - use to set expiration date for persistent cookies.
*/
/*
*   var expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
app.use(session({
  name: 'session',
  keys: ['key1', 'key2'],
  cookie: {
    secure: true,
    httpOnly: true,
    domain: 'example.com',
    path: 'foo/bar',
    expires: expiryDate
  }
}))
*/

const expiryDate = new Date(Date.now() + 60 * 60 * 1000);// 1 hour
app.use(session({
  secret: process.env.SECRET,
  name  : 'notdefaultname',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: true,
    expires: expiryDate
  }
}));

//Create custom local strategy using Passport-Local for Passport.
passport.use(new LocalStrategy(
    (username, password, done) => {
      console.log('Here we go: ' + username);
      //db.query("select * from user where usernmae = ?", [username])
      //if(username === db.)
      if (username !== process.env.USR_NAME || password !== process.env.USR_PWD)
      { return done(null, false); }
      else {      return done(null, { username: username } ); }
    }
));

app.use(passport.initialize());
app.use(passport.session());
//Authentication and Redirection using Passport.
//A redirect is commonly issued after authenticating a request.
//
app.post('/login',
    passport.authenticate('local', { successRedirect: '/node/index.html', failureRedirect: '/node/login.html' }));

//  trust first proxy
//  app.set('trust proxy', 1)
app.set('trust proxy');
//  Key and Certificate file for use with Https
const sslkey  = fs.readFileSync('/etc/pki/tls/private/ca.key');
const sslcert = fs.readFileSync('/etc/pki/tls/certs/ca.crt');
const options = {
  key: sslkey,
  cert: sslcert
};

/*app.get('/', (req,res) => {
  // need to redirect to /login
  if (req.secure) {
    console.log(req.user);
    if(req.user !== undefined) res.send('Hello ' + req.user.username);
    else res.send('https :)');
  }
  else res.send('hello not secure?');
});*/

/*app.get('/auth', (req, res) => {
  console.log('super auth');
  if(req.user !== undefined){
    res.send('{"user":"ok"}');
  } else {
    res.send('{"user": null}');
  }
});*/

/*
*     #################     Session and Cookies Ends Here      ####################
*/


const callback = (result, res) => {
  //console.log(res);
  res.send(result);
};


/*app.use('/upload', upload.single('mediafile'), (req, res, next) => {
  //console.log(req.body.category);console.log(req.body.title);
  //console.log(req.body.details);
  //console.log(req.file.filename);

  const data = [req.body.category, req.body.title, req.body.details, req.file.filename];
  //console.log(res);
  database.insert(data, connection, next);
});

app.post('/upload', (req, res) => {
  console.log('App post for upload');
  //console.log(res);
  database.select(connection, callback, res);
});*/
// respond to post and save file
app.post('/upload', upload.single('mediafile'), (req, res, next) => {
  next();
});

// create thumbnail
app.use('/upload', (req, res, next) => {
  //console.log('Creating thumbnail for : '+ req.file.filename);
  resize.doResize(req.file.path, 300,
      './public/thumbs/' + req.file.filename + '_thumb', next);
});

// create medium image
app.use('/upload', (req, res, next) => {
  //console.log('Creating medium size image for : '+ req.file.filename);
  resize.doResize(req.file.path, 640,
      './public/medium/' + req.file.filename + '_medium', next);
});

// get coordinates
app.use('/upload', (req, res, next) => {
  //console.log(req.file.path)
  exif.getCoordinates(req.file.path).then(coords => {
    req.coordinates = coords;
    //console.log('Cordinates obtained :' + coords);
    next();
  });
});

// insert to database
//app.use('/upload', (req, res ) => {
app.use('/upload', (req, res, next) => {
  //console.log('inserting data... ');
  const data = [
    req.body.category,
    req.body.title,
    req.body.details,
    req.file.filename + '_thumb',
    req.file.filename + '_medium',
    req.file.filename,
    req.coordinates,
  ];
  //console.log("Data to insert : " + data);
  database.insert(data, connection, next);
});

// get updated data form database and send to client
app.use('/upload', (req, res) => {
  database.select(connection, callback, res);
});

app.get('/media', (req, res) => {
  //database.getcolumn(connection,callback, res);
  database.select(connection, callback, res);
});

app.patch('/media/update', (req, res) => {
  //database.getcolumn(connection,callback, res);
  //database.select(connection, callback, res);
  //console.log(request);
  database.update(req.body, connection);
  //responce.send( {"Job Status": "Unknown"} );
});

app.delete('/media/', (req, res) => {
  //database.delete()
  console.log(req.body);
  console.log(req.params);
  res.send("DELETE Called");
  database.delet(req.body, connection)
});

//app.listen(3000);

/*
*     ##############    Redirection with nodeJS   ###############
*
*/


http.createServer((req, res) => {
  const redir = 'https://' + req.headers.host + req.url;
  console.log(redir);
  res.writeHead(301, { 'Location': redir });
  res.end();
}).listen(8000);
https.createServer(options, app).listen(3000);

