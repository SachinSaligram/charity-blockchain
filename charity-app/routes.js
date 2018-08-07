//SPDX-License-Identifier: Apache-2.0

var charity = require('./controller.js');

module.exports = function(app){

  app.get('/get_all_events', function(req, res){
    charity.get_all_events(req, res);
  });

  app.get('/add_event/:event', function(req, res){
    charity.add_event(req, res);
  });

  app.get('/get_mongo', function(req, res){
    charity.get_mongo(req, res);
  });
}