// SPDX-License-Identifier: Apache-2.0

'use strict';

var app = angular.module('application', []);

// Angular Controller
app.controller('appController', function($scope, appFactory){

	$("#success_holder").hide();
	$("#success_create").hide();
	$("#error_holder").hide();
	$("#error_query").hide();

	$scope.queryAllCharities = function(){

		appFactory.queryAllCharities(function(data){
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

	$scope.queryCharity = function(){

		var id = $scope.charity_id;

		appFactory.queryCharity(id, function(data){
			$scope.query_charity = data;

			if ($scope.query_charity == "Could not locate charity"){
				console.log()
				$("#error_query").show();
			} else{
				$("#error_query").hide();
			}
		});
	}

	$scope.recordCharity = function(){

		appFactory.recordCharity($scope.charity, function(data){
			$scope.create_charity = data;
			$("#success_create").show();
		});
	}

});

// Angular Factory
app.factory('appFactory', function($http){

	var factory = {};

    factory.queryAllCharities = function(callback){

    	$http.get('/get_all_charities/').success(function(output){
			callback(output)
		});
	}

	factory.queryCharity = function(id, callback){
    	$http.get('/get_charity/'+id).success(function(output){
			callback(output)
		});
	}

	factory.recordCharity = function(data, callback){

		var charity = data.id + "-" + data.name + "-" + data.category + "-" + data.country + "-" + data.state + "-" + data.city + "-" + data.date + "-" + data.director;

    	$http.get('/add_charity/'+charity).success(function(output){
			callback(output)
		});
	}

	return factory;
});
