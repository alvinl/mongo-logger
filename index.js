
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

module.exports = function (options) {

  // Only attempt to connect if not already connected
  // to a MongoDB instance
  if (!mongoose.connection.readyState)
    mongoose.connect(options.uri);

  var timeStampOpts = { type: Date, default: Date.now };

  // Set a ttl if passed as an option
  if (options.expire)
    timeStampOpts.expires = options.expire;

  var errorSchema = new Schema({

    timeStamp: timeStampOpts,
    message:   String,
    stack:     String,
    user:      String,
    method:    String,
    path:      String,
    headers:   String,
    errName:   String

  });

  var collectionName = (options.collection || 'errors');

  // If a collection with the same name as the one passed in options exists then use it,
  // otherwise compile a new model.
  var ErrorLog = (mongoose.models[collectionName]) ? mongoose.models[collectionName] : mongoose.model(collectionName, errorSchema);

  return function (err, req, res, next) {

    // Log error to mongo
    ErrorLog.create({ message: err.message, stack: err.stack, user: req.ip, method: req.method, path: req.path, headers: JSON.stringify(req.headers), errName: err.name}, function (logError) {

      if (logError) console.error(logError);

      // Call the next middleware regardless of logger status
      return next(err);

    });

  };

};
