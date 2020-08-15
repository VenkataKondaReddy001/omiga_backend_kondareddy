var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var assert = require('assert');

var url = 'mongodb://localhost:27017/';

var dbName = 'origa'

/* GET home page. */
router.get('/', function(req, res, next) {
    res.redirect('get-data');
  });
  
router.get('/get-data', function(req, res, next) {
  var resultArray = [];
  mongo.connect(url, function(err, client) {
    const db = client.db(dbName);
    if(err){
        res.send(err)
    }else{
        assert.equal(null, err);
        var cursor = db.collection('users').aggregate([ { $lookup: { from: 'orders', localField: 'userId', foreignField: 'userId', as: 'objectResult' } } , { "$project": {userId:1, name:1, "noOfOrders":{"$size":"$objectResult"}, "averageBillValue":{"$avg": "$objectResult.subtotal"}}}]);
        cursor.forEach(function(doc, err) {
            assert.equal(null, err);
            resultArray.push(doc);
        }, function() {
            client.close();
            res.send({items: resultArray});
        });
    }
  });
});

router.get('/update', function(req, res, next) {
  var ret = {'success': true, 'message' : 'Successfully updated'}
  mongo.connect(url, function(err, client) {
    const db = client.db(dbName);
    if(err){
        ret['success'] = false
        ret['message'] = err
        res.send(ret)
    }else{
      assert.equal(null, err);
      var cursor = db.collection('users').aggregate([ { $lookup: { from: 'orders', localField: 'userId', foreignField: 'userId', as: 'objectResult' } } , { "$project": {userId:1, name:1, "noOfOrders":{"$size":"$objectResult"}, "averageBillValue":{"$avg": "$objectResult.subtotal"}}}]);
      cursor.forEach(function(doc, err) {
        if (err){
          assert.equal(null, err);
          ret['success'] = false
          ret['message'] = err
        }else{
          doc = JSON.parse(JSON.stringify(doc));
          var noOfOrders = doc['noOfOrders'] || 0
          db.collection('users').updateOne({'userId':doc.userId}, {$set : {'noOfOrders': noOfOrders}}, {upset : false , multi : true})
  
        }
      }, function() {
        client.close();
        res.send(ret);
      });
    }
  });
});


module.exports = router;