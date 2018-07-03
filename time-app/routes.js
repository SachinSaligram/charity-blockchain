//SPDX-License-Identifier: Apache-2.0

var tracker = require('./controller.js');

module.exports = function(app){

  app.get('/get_time/:id', function(req, res){
    tracker.get_time(req, res);
  });
  app.get('/get_all_time', function(req, res){
    tracker.get_all_time(req, res);
  });
}