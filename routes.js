const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const request = require('request') //just makes api calls to OWA easier

module.exports = function (app, db) {
  // app.get('/', (req,res) => {
  //   // res.sendFile(__dirname + '/login.html');
  //   res.send('hello world')
  // })

  function ensureAuthenticated(req, res, next) {
    console.log("checking authentication");
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  };

  app.get('/weather', ensureAuthenticated, (req, res) => {
    console.log('sending weather.html')
    res.sendFile(__dirname + '/public/weather.html');
  })

  app.get('/getweather',ensureAuthenticated, function (req, res) {
    request('https://api.openweathermap.org/data/2.5/forecast?q=' + req.query.city + '&appid=' + process.env.OWAKEY, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        // console.log('response')
        // console.log(JSON.parse(body))
        res.json(JSON.parse(body))
      }
    })
  });

  app.get('/getuserdata', ensureAuthenticated, function(req, res, next) {
    console.log(req.user)
    db.collection('users').findOne({_id: req.user._id}, function(err, user) {
      if (err) {
        next(err)
      } else if (user) {
        res.json({
          cities: user.cities,
          units: user.units
        })
      }
    })
  })

  app.post('/updateuserinfo', ensureAuthenticated, function(req, res, next) {
    console.log(req.body)
    db.collection('users').updateOne(
      {_id: req.user._id},
      {$set: req.body}
    )
    res.end()
  })

  app.post('/login', passport.authenticate('local', { failureRedirect: '/' }), function (req, res) {
    console.log("User " + req.username + " attempted to log in.")
    res.redirect('/weather')
  })

  app.route('/logout')
    .get((req, res) => {
      console.log('logout request recieved')
      req.session.destroy()
      req.logout();
      res.redirect('/');
    });

  app.route('/register')
    .post((req, res, next) => {
      db.collection('users').findOne({ username: req.body.username }, function (err, user) {
        if (err) {
          next(err);
        } else if (user) {
          res.send('user already exists')
          // res.redirect('/');
        } else {
          let hash = bcrypt.hashSync(req.body.password, 12);
          db.collection('users').insertOne({
            username: req.body.username,
            password: hash,
            cities: ['Sydney'],
            units: 'C'
          },
            (err, doc) => {
              if (err) {
                res.redirect('/');
              } else {
                next(null, user);
              }
            }
          )
        }
      })
    },
      passport.authenticate('local', { failureRedirect: '/' }),
      (req, res, next) => {
        res.redirect('/weather');
      }
    );
}

