// Generated by CoffeeScript 1.8.0
(function() {
  var DEV, MONGODB_PORT, MONGODB_SERVER, app, mongo, server, url;

  app = require('express')();

  server = require('http').Server(app);

  mongo = require('mongodb');

  DEV = process.env.NODE_ENV === 'development';

  MONGODB_SERVER = DEV ? 'localhost' : 'db_mongo';

  MONGODB_PORT = parseInt(process.env.MONGODB_PORT || 27017, 10);

  console.log(" ---> Starting NewsBlur Favicon server...");

  if (!DEV && !process.env.NODE_ENV) {
    console.log(" ---> Specify NODE_ENV=<development,production>");
    return;
  } else if (DEV) {
    console.log(" ---> Running as development server");
  } else {
    console.log(" ---> Running as production server");
  }

  if (DEV) {
    url = "mongodb://" + MONGODB_SERVER + ":" + MONGODB_PORT + "/newsblur";
  } else {
    url = "mongodb://" + MONGODB_SERVER + ":" + MONGODB_PORT + "/newsblur?replicaSet=nbset&readPreference=secondaryPreferred";
  }

  mongo.MongoClient.connect(url, (function(_this) {
    return function(err, db) {
      var _ref, _ref1;
      console.log(" ---> Connected to " + ((_ref = db.serverConfig) != null ? _ref.s.host : void 0) + ":" + ((_ref1 = db.serverConfig) != null ? _ref1.s.port : void 0) + " / " + err);
      return _this.collection = db.collection("feed_icons");
    };
  })(this));

  app.get(/\/rss_feeds\/icon\/(\d+)\/?/, (function(_this) {
    return function(req, res) {
      var etag, feed_id;
      feed_id = parseInt(req.params[0], 10);
      etag = req.header('If-None-Match');
      console.log((" ---> Feed: " + feed_id + " ") + (etag ? " / " + etag : ""));
      return _this.collection.findOne({
        _id: feed_id
      }, function(err, docs) {
        var body;
        if (!err && etag && docs && (docs != null ? docs.color : void 0) === etag) {
          console.log((" ---> Cached: " + feed_id + ", etag: " + etag + "/" + (docs != null ? docs.color : void 0) + " ") + (err ? "(err: " + err + ")" : ""));
          return res.sendStatus(304);
        } else if (!err && docs && docs.data) {
          console.log((" ---> Req: " + feed_id + ", etag: " + etag + "/" + (docs != null ? docs.color : void 0) + " ") + (err ? "(err: " + err + ")" : ""));
          res.header('etag', docs.color);
          body = new Buffer(docs.data, 'base64');
          res.set("Content-Type", "image/png");
          return res.status(200).send(body);
        } else {
          console.log((" ---> Redirect: " + feed_id + ", etag: " + etag + "/" + (docs != null ? docs.color : void 0) + " ") + (err ? "(err: " + err + ")" : ""));
          if (DEV) {
            return res.redirect('/media/img/icons/circular/world.png');
          } else {
            return res.redirect('https://www.newsblur.com/media/img/icons/circular/world.png');
          }
        }
      });
    };
  })(this));

  app.listen(3030);

}).call(this);
