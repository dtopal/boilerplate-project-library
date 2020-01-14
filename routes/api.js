/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
    console.log('DB connection successful');
    var collection = db.collection('books');

    app.route('/api/books')
      .get(function (req, res){
        //response will be array of book objects
        //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
        collection.find({}).toArray((err, data) => {
          if (err) {
            console.log(err);
          } else {
            res.send(data);
          }
        });

      })

      .post(function (req, res){
        var title = req.body.title;
        //response will contain new book object including atleast _id and title
        if (title == undefined || title == '') {
          res.send('Missing title');
          return;
        }
        collection.insertOne({
          'title': title,
          commentcount: 0,
          comments: [],
        }, (err, data) => {
          res.json(data.ops[0]);
        });

      })

      .delete(function(req, res){
        //if successful response will be 'complete delete successful'
        collection.deleteMany({}, (err, data) => {
          if (err) {
            console.log(err);
            res.send('complete delete unsuccessful');
          } else {
            res.send('complete delete successful');
          }
        });
      });



    app.route('/api/books/:id')
      .get(function (req, res){
        var bookid = req.params.id;
        //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
        collection.findOne({ _id: ObjectId(bookid) }, (err, doc) => {
          if (err) {
            console.log(err);
            return;
          } else {
            if (doc == null) {
              res.send('no book exists');
              return;
            }
            var response = { _id: doc._id, title: doc.title, comments: doc.comments };
            res.json(response);
          }
        })
      })

      .post(function(req, res){
        var bookid = req.params.id;
        if (!req.body.comment) {
          res.send('Missing field');
          return;
        }
        var comment = req.body.comment;
        //json res format same as .get
        collection.findOneAndUpdate(
          { _id: ObjectId(bookid) },
          { $push: { comments: comment } },
          { returnOriginal: false },
          function(err, data){
            if (err) {
              console.log(err);
            } else {
              res.json(data.value);
            }
          }
        );
      })

      .delete(function(req, res){
        var bookid = req.params.id;
        //if successful response will be 'delete successful'
        collection.findOneAndDelete({ _id: ObjectId(bookid) }, (err, data) => {
          if (err) {
            res.send('could not delete ' + bookid);
          } else {
            res.send('delete successful');
          }
        });
      });


    //404 Not Found Middleware
    app.use(function(req, res, next) {
      res.status(404)
        .type('text')
        .send('Not Found');
    });

  });
};
