const express       = require('express');
const bodyParser    = require('body-parser');
const session       = require('express-session');
const passport      = require('passport');
const mongo         = require('mongodb').MongoClient;
require('dotenv').config() //so we can make use of .env files

const app           = express();
const routes        = require('./routes.js');
const auth          = require('./auth.js');



app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  unset: 'destroy'
}));
app.use(passport.initialize());
app.use(passport.session());

mongo.connect(process.env.DATABASE,
  {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  },
  (err, client) => {
  if(err) {
    console.log('Database error: ' + err);
  } else {
    console.log('database connected')
    var db = client.db()
    
    routes(app, db);
    auth(app, db);

    var listener = app.listen(process.env.PORT||3000, function () {
      console.log('Your app is listening on port ' + listener.address().port);
    });
  }
})