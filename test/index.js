
var mongoose = require('mongoose'),
    request = require('supertest'),
    express = require('express'),
    should  = require('should'),
    Schema  = mongoose.Schema;

var default_collection,
    custom_collection,
    ttl_collection;

describe('mongo-logger', function () {

  before(function (done) {
  
    var db = mongoose.createConnection(process.env.DB);

    var errorSchema = new Schema({

      timeStamp: Date,
      message:   String,
      stack:     String,
      user:      String,
      method:    String,
      path:      String,
      headers:   String,
      errName:   String

    });

    default_collection = db.model('errors', errorSchema);
    custom_collection  = db.model('test_errors', errorSchema);
    ttl_collection     = db.model('errors_ttl', errorSchema);

    db.once('open', function () {

      return done();

    });

  });
  
  it('Should log errors to the default collection name (errors)', function (done) {
    
    var app = express();

    app.get('/', function (req, res, next) {
    
      return next(new Error('Test error'));

    });
    app.use(require('../')({ uri: process.env.DB }));
    app.use(function (routeErr, req, res) {
      
      return res.status(500).end();

    });

    request(app)
      .get('/')
      .expect(500)
      .end(function (err) {

        should.not.exist(err);

        default_collection
          .find(function (err, errDocs) {
            
            should.not.exist(err);
            should.exist(errDocs);
            return done();

          });

      });

  });

  it('Should log errors to the collection name passed in options', function (done) {
    
    var app = express();

    app.get('/', function (req, res, next) {
    
      return next(new Error('Test error'));

    });
    app.use(require('../')({ uri: process.env.DB,
                            collection: 'test_errors' }));
    app.use(function (routeErr, req, res) {
      
      return res.status(500).end();

    });

    request(app)
      .get('/')
      .expect(500)
      .end(function (err) {

        should.not.exist(err);

        custom_collection
          .find(function (err, errDocs) {
            
            should.not.exist(err);
            should.exist(errDocs);
            return done();

          });

      });

  });

  it('Should log errors to a collection with a ttl', function (done) {
    
    var app = express();

    app.get('/', function (req, res, next) {
    
      return next(new Error('Test error'));

    });
    app.use(require('../')({ uri: process.env.DB,
                            collection: 'errors_ttl',
                            expire: '1m' }));
    app.use(function (routeErr, req, res) {
      
      return res.status(500).end();

    });

    request(app)
      .get('/')
      .expect(500)
      .end(function (err) {

        should.not.exist(err);

        ttl_collection
          .find(function (err, errDocs) {
            
            should.not.exist(err);
            should.exist(errDocs);

            ttl_collection.collection.getIndexes(function (err, indexes) {
              
              should.not.exist(err);
              indexes.should.have.property('timeStamp_1');
              return done();

            });

          });

      });

  });

});
