Mongo Logger
============
[![Build Status](https://travis-ci.org/alvinl/mongo-logger.svg?branch=master)](https://travis-ci.org/alvinl/mongo-logger)

Middleware that logs errors to MongoDB

## Install
```
$ npm install git://github.com/alvinl/mongo-logger.git
```

## Example

The following example will log errors to a collection named `errors` and each doc. will expire after 30 days.
``` js

var mongoLogger = require('mongo-logger'),
    app         = express();

app.use(mongoLogger({ uri: 'mongodb://localhost:27017/errorDb',
                      collection: 'errors',
                      expire: '30d' }));
```

## Options
- `uri` (Required) MongoDB uri to connect to.
- `collection` The collection name to save the logs to. (Defaults to `errors`)
- `expire` TTL to set to the logs. If not set, the logs will never expire.

## Log
The following is what a log document consists of
- `timeStamp` Timestamp of when the log was saved, also used for expiring logs.
- `message` The error message (`Error.message`)
- `stack` The error stack (`Error.stack`)
- `user` The clients ip
- `method` The http method (ex. `GET`)
- `path` The url path where the error came from
- `headers` The headers of the client
- `errName` The type of error (`Error`, `TypeError`, etc)
