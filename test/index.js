
var mongoose = require('mongoose'),
    request = require('supertest'),
    express = require('express'),
    should  = require('should');

describe('mongo-logger', function () {
  
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
        
        mongoose.models.errors.find().exec(function (err, errDocs) {
          
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
        
        mongoose.models['test_errors'].find().exec(function (err, errDocs) {

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
        
        mongoose.models['errors_ttl'].find().exec(function (err, errDocs) {

          should.not.exist(err);
          should.exist(errDocs);
          
          mongoose.models['errors_ttl'].collection.getIndexes(function (err, indexes) {

            indexes.should.have.property('timeStamp_1');
            return done();

          });

        });

      });

  });

});
