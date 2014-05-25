
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    isConnected;

module.exports = function (options) {

  // Only attempt to connect once
  if (!isConnected)
    mongoose.connect(options.uri);

  mongoose.connection.once('open', function () {

    isConnected = true;

  });

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

  var ErrorLog = mongoose.model(options.collection || 'errors', errorSchema);

  return function (err, req, res, next) {

    // Log error to mongo
    ErrorLog.create({ message: err.message, stack: err.stack, user: req.ip, method: req.method, path: req.path, headers: JSON.stringify(req.headers), errName: err.name}, function (logError) {

      if (logError) console.error(logError);

      // Call the next middleware regardless of logger status
      return next(err);

    });

  };

};
