// SPDX-License-Identifier: Apache-2.0

'use strict';

var app = angular.module('application', []);

// Angular Controller
app.controller('appController', function($scope, appFactory){

	$("#success_holder").hide();
	$("#success_create").hide();
	$("#error_holder").hide();
	$("#error_query").hide();

	$scope.findEvents = function(){

		appFactory.findEvents(function(data){
			var array = [];
			for (var i = 0; i < data.length; i++){
				parseInt(data[i].Key);
				data[i].Record.Key = parseInt(data[i].Key);
				array.push(data[i].Record);
			}
			array.sort(function(a, b) {
			    return parseFloat(a.Key) - parseFloat(b.Key);
			});
			$scope.all_time = array;
		});
	}

	$scope.mongo = function(){

		appFactory.mongo(function(data){
			var array = [];
			data.forEach( function(myDoc) { array.push(myDoc) } )
			$scope.mongo_data = array;
			console.log(array.length);
		});
	}

	$scope.recordDonation = function(){

		appFactory.recordDonation($scope.event, function(data){
			$scope.create_event = data;
			$("#success_create").show();
		});
	}
});


// Angular Factory
app.factory('appFactory', function($http){

	var factory = {};

    factory.findEvents = function(callback){

    	$http.get('/get_all_events/').success(function(output){
			callback(output)
		});
	}

	factory.mongo = function(callback){

    	$http.get('/get_mongo/').success(function(output){
			callback(output)
		});
	}

	factory.recordDonation = function(data, callback){
		
		var event = data.id + "-" + data.name + "-" + data.event + "-" + data.amount;

    	$http.get('/add_event/'+event).success(function(output){
			callback(output)
		});
	}

	return factory;
});
