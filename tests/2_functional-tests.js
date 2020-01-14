/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {

      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'book title' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.property(res.body, 'title', 'Response should contain title');
            assert.property(res.body, '_id', 'Response should contain _id');
            assert.equal(res.body.title, 'book title');
            done();
          });
      });

      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'Missing title');
            done();
          });
      });

    });


    suite('GET /api/books => array of books', function(){

      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'Response should be an array');
            assert.property(res.body[0], 'title', 'Books in array should contain title');
            assert.property(res.body[0], '_id', 'Books in array should contain _id');
            assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
            done();
          });
      });

    });


    suite('GET /api/books/[id] => book object with [id]', function(){

      test('Test GET /api/books/[id] with id not in db',  function(done){
        var testID;

        chai.request(server)
          .post('/api/books')
          .send({ title: 'test' })
          .end(function(err, res){
            testID = res.body._id;
            //console.log('testID ' + testID);

            //delete book
            chai.request(server)
              .delete('/api/books/' + testID)
              .end(function(err, res){
                //look for the book
                chai.request(server)
                  .get('/api/books/' + testID)
                  .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'no book exists');
                    done();
                  })
              });
          });
      });

      test('Test GET /api/books/[id] with valid id in db',  function(done){
        var testID;
        chai.request(server)
          .post('/api/books')
          .send({ title: 'test book title' })
          .end(function(err, response){
            testID = response.body._id;
            chai.request(server)
              .get('/api/books/' + testID)
              .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.body._id, testID);
                assert.equal(res.body.title, 'test book title');
                assert.isArray(res.body.comments, 'Response should contain an array of comments');
                done()
              });
          });
      });

    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){

      test('Test POST /api/books/[id] with comment', function(done){
        var testID;
        var testTitle = 'test book title';
        var testComment = 'this is a test comment';
        chai.request(server)
          .post('/api/books')
          .send({ title: testTitle })
          .end(function(err, response){
            testID = response.body._id;
            chai.request(server)
              .post('/api/books/' + testID)
              .send({ comment: testComment })
              .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.body._id, testID);
                assert.equal(res.body.title, testTitle);
                assert.isArray(res.body.comments, 'Response should contain an array of comments');
                done();
              });
          });
      });

    });

  });

});
