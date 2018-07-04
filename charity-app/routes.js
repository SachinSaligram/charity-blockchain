//SPDX-License-Identifier: Apache-2.0

var charity = require('./controller.js');

module.exports = function(app){

  app.get('/get_charity/:id', function(req, res){
    charity.get_charity(req, res);
  });
  app.get('/get_all_charities', function(req, res){
    charity.get_all_charities(req, res);
  });
  app.get('/add_charity/:charity', function(req, res){
    charity.add_charity(req, res);
  });
}